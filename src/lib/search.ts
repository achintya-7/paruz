import { type BackendId, detectBackend } from "./backend.js";

export interface Package {
  name: string;
  version: string;
  description: string;
  repo: string;
  installed: boolean;
}

const run = async (cmd: string[]): Promise<string> => {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text;
};

const parseSearchOutput = (stdout: string, installedSet: Set<string>): Package[] => {
  const packages: Package[] = [];
  const lines = stdout.split("\n");

  for (let i = 0; i < lines.length - 1; i += 2) {
    const header = lines[i].trim();
    const desc = lines[i + 1]?.trim() ?? "";

    // format: repo/name version [installed]
    const match = header.match(/^(\S+)\/(\S+)\s+(\S+)/);
    if (!match) continue;

    const [, repo, name, version] = match;
    packages.push({
      name,
      version,
      description: desc,
      repo,
      installed: installedSet.has(name),
    });
  }

  return packages;
};

export const getInstalledPackages = async (
  backend: BackendId = detectBackend(),
): Promise<Set<string>> => {
  try {
    if (backend === "brew") {
      const [formulae, casks] = await Promise.all([
        run(["brew", "list", "--formula", "-1"]),
        run(["brew", "list", "--cask", "-1"]),
      ]);
      return new Set([...formulae.split("\n"), ...casks.split("\n")].filter(Boolean));
    }

    const text = await run(["pacman", "-Qq"]);
    return new Set(text.split("\n").filter(Boolean));
  } catch {
    return new Set();
  }
};

export const searchPackages = async (
  query: string,
  aurHelper: "paru" | "yay" = "paru",
  backend: BackendId = detectBackend(),
): Promise<Package[]> => {
  if (!query.trim()) return [];

  const installed = await getInstalledPackages(backend);

  try {
    if (backend === "brew") {
      const stdout = await run(["brew", "search", query]);
      // `brew search` prints bare names under ==> Formulae / ==> Casks headers.
      let repo = "formula";
      const packages: Package[] = [];
      for (const line of stdout.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith("==>")) {
          repo = /cask/i.test(trimmed) ? "cask" : "formula";
          continue;
        }
        packages.push({
          name: trimmed,
          version: "",
          description: "",
          repo,
          installed: installed.has(trimmed),
        });
      }
      return packages;
    }

    const stdout = await run([aurHelper, "-Ss", "--noconfirm", query]);
    return parseSearchOutput(stdout, installed);
  } catch {
    return [];
  }
};

export const listInstalled = async (backend: BackendId = detectBackend()): Promise<Package[]> => {
  try {
    if (backend === "brew") {
      const stdout = await run(["brew", "list", "--versions"]);
      return stdout
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [name, ...versions] = line.split(" ");
          return {
            name,
            version: versions.join(" "),
            description: "",
            repo: "local",
            installed: true,
          };
        });
    }

    const stdout = await run(["pacman", "-Q"]);
    return stdout
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [name, version] = line.split(" ");
        return { name, version, description: "", repo: "local", installed: true };
      });
  } catch {
    return [];
  }
};
