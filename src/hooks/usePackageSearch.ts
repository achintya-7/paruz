import { useEffect, useState } from "react";
import { buildCache, fuzzySearch, isCacheStale, loadCache } from "../lib/cache.js";
import { getInstalledPackages, type Package } from "../lib/search.js";

let cachedNames: string[] = [];
let installedSet: Set<string> = new Set();
let cacheReady = false;

// Module-level state is shared by every consumer of this hook, so mutations have to be
// broadcast explicitly — otherwise a fresh install doesn't show up until the query changes.
const listeners = new Set<() => void>();
const notify = () => {
  for (const listener of listeners) listener();
};

const initCache = async () => {
  if (cacheReady) return;
  installedSet = await getInstalledPackages();
  const stale = await isCacheStale();
  cachedNames = stale ? await buildCache() : await loadCache();
  cacheReady = true;
  notify();
};

export const refreshCache = async () => {
  cacheReady = false;
  notify();
  installedSet = await getInstalledPackages();
  cachedNames = await buildCache();
  cacheReady = true;
  notify();
};

/** Re-read the installed package set — call after an install or remove so [i] is accurate. */
export const refreshInstalled = async () => {
  installedSet = await getInstalledPackages();
  notify();
};

initCache();

const toPackages = (names: string[]): Package[] =>
  names.map((name) => ({
    name,
    version: "",
    description: "",
    repo: "",
    installed: installedSet.has(name),
  }));

export const usePackageSearch = (query: string) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(!cacheReady);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const listener = () => setRevision((r) => r + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    setLoading(!cacheReady);
    if (!cacheReady) return;
    if (!query.trim()) {
      setPackages([]);
      return;
    }
    const names = fuzzySearch(query, cachedNames);
    setPackages(toPackages(names));
  }, [query, revision]);

  return { packages, loading };
};
