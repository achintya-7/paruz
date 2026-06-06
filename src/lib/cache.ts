import { join } from "path";
import { homedir } from "os";

const CACHE_DIR = join(homedir(), ".cache", "paruz");
const CACHE_PATH = join(CACHE_DIR, "packages.txt");

const ensureCacheDir = async () => {
  try {
    await Bun.$`mkdir -p ${CACHE_DIR}`.quiet();
  } catch {}
};

export const buildCache = async (): Promise<string[]> => {
  await ensureCacheDir();

  try {
    // Get official repo packages
    const repoProc = Bun.spawn(["pacman", "-Slq"], { stdout: "pipe", stderr: "pipe" });
    const repoOut = await new Response(repoProc.stdout).text();
    await repoProc.exited;

    // Get AUR packages list
    let aurLines: string[] = [];
    try {
      const aurProc = Bun.spawn(
        ["sh", "-c", "curl -s 'https://aur.archlinux.org/packages.gz' | gunzip"],
        { stdout: "pipe", stderr: "pipe" }
      );
      const aurOut = await new Response(aurProc.stdout).text();
      await aurProc.exited;
      aurLines = aurOut.split("\n").filter(Boolean);
    } catch {}

    const repoLines = repoOut.split("\n").filter(Boolean);
    const all = [...new Set([...repoLines, ...aurLines])];

    await Bun.write(CACHE_PATH, all.join("\n"));
    return all;
  } catch {
    return [];
  }
};

export const loadCache = async (): Promise<string[]> => {
  const file = Bun.file(CACHE_PATH);
  if (!(await file.exists())) return [];
  const text = await file.text();
  return text.split("\n").filter(Boolean);
};

export const isCacheStale = async (): Promise<boolean> => {
  const file = Bun.file(CACHE_PATH);
  if (!(await file.exists())) return true;
  const stat = await file.stat();
  const age = Date.now() - stat.mtime.getTime();
  // Stale after 24 hours
  return age > 24 * 60 * 60 * 1000;
};

// Simple fuzzy scorer: returns a score >= 0, higher = better match. -1 = no match.
export const fuzzyScore = (query: string, target: string): number => {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  if (t === q) return 1000;
  if (t.startsWith(q)) return 900;
  if (t.includes(q)) return 800;

  let qi = 0;
  let score = 0;
  let lastMatch = -1;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += lastMatch === ti - 1 ? 10 : 1;
      lastMatch = ti;
      qi++;
    }
  }

  if (qi < q.length) return -1;
  return score;
};

export const fuzzySearch = (query: string, names: string[], limit = 100): string[] => {
  if (!query.trim()) return [];

  const scored: [string, number][] = [];
  for (const name of names) {
    const s = fuzzyScore(query, name);
    if (s >= 0) scored.push([name, s]);
  }

  return scored
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name);
};
