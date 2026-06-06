export interface Package {
  name: string;
  version: string;
  description: string;
  repo: string;
  installed: boolean;
}

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

export const getInstalledPackages = async (): Promise<Set<string>> => {
  try {
    const proc = Bun.spawn(["pacman", "-Qq"], { stdout: "pipe", stderr: "pipe" });
    const text = await new Response(proc.stdout).text();
    await proc.exited;
    return new Set(text.split("\n").filter(Boolean));
  } catch {
    return new Set();
  }
};

export const searchPackages = async (
  query: string,
  aurHelper: "paru" | "yay" = "paru",
): Promise<Package[]> => {
  if (!query.trim()) return [];

  const installed = await getInstalledPackages();

  try {
    const proc = Bun.spawn([aurHelper, "-Ss", "--noconfirm", query], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const stdout = await new Response(proc.stdout).text();
    await proc.exited;
    return parseSearchOutput(stdout, installed);
  } catch {
    return [];
  }
};

export const listInstalled = async (): Promise<Package[]> => {
  try {
    const proc = Bun.spawn(["pacman", "-Q"], { stdout: "pipe", stderr: "pipe" });
    const stdout = await new Response(proc.stdout).text();
    await proc.exited;

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
