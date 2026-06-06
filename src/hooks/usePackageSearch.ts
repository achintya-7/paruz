import { useState, useEffect } from "react";
import { getInstalledPackages, type Package } from "../lib/search.js";
import { loadCache, buildCache, isCacheStale, fuzzySearch } from "../lib/cache.js";

let cachedNames: string[] = [];
let installedSet: Set<string> = new Set();
let cacheReady = false;

const initCache = async () => {
  if (cacheReady) return;
  installedSet = await getInstalledPackages();
  const stale = await isCacheStale();
  cachedNames = stale ? await buildCache() : await loadCache();
  cacheReady = true;
};

export const refreshCache = async () => {
  cacheReady = false;
  installedSet = await getInstalledPackages();
  cachedNames = await buildCache();
  cacheReady = true;
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

  useEffect(() => {
    if (!cacheReady) {
      setLoading(true);
      return;
    }
    setLoading(false);
    if (!query.trim()) {
      setPackages([]);
      return;
    }
    const names = fuzzySearch(query, cachedNames);
    setPackages(toPackages(names));
  }, [query]);

  // Poll until cache is ready on first load
  useEffect(() => {
    if (cacheReady) return;
    const interval = setInterval(() => {
      if (cacheReady) {
        setLoading(false);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return { packages, loading };
};
