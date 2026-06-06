export interface PackageInfo {
  name: string;
  version: string;
  description: string;
  repo: string;
  url: string;
  licenses: string;
  groups: string;
  provides: string;
  depends: string;
  optDepends: string;
  conflicts: string;
  replaces: string;
  installedSize: string;
  packager: string;
  buildDate: string;
  installDate: string;
  installed: boolean;
}

const parseInfoOutput = (stdout: string): Partial<PackageInfo> => {
  const info: Record<string, string> = {};
  const fieldMap: Record<string, keyof PackageInfo> = {
    Name: "name",
    Version: "version",
    Description: "description",
    URL: "url",
    Licenses: "licenses",
    Groups: "groups",
    Provides: "provides",
    "Depends On": "depends",
    "Optional Deps": "optDepends",
    "Conflicts With": "conflicts",
    Replaces: "replaces",
    "Installed Size": "installedSize",
    Packager: "packager",
    "Build Date": "buildDate",
    "Install Date": "installDate",
    Repository: "repo",
  };

  for (const line of stdout.split("\n")) {
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    const val = line.slice(sep + 1).trim();
    if (key && val && val !== "None") info[key] = val;
  }

  const result: Partial<PackageInfo> = {};
  for (const [raw, mapped] of Object.entries(fieldMap)) {
    if (info[raw]) (result as Record<string, string | undefined>)[mapped] = info[raw];
  }
  return result;
};

export const getPackageInfo = async (
  name: string,
  aurHelper: "paru" | "yay" = "paru",
): Promise<Partial<PackageInfo>> => {
  try {
    const proc = Bun.spawn([aurHelper, "-Si", name], { stdout: "pipe", stderr: "pipe" });
    const stdout = await new Response(proc.stdout).text();
    await proc.exited;
    return parseInfoOutput(stdout);
  } catch {
    return { name };
  }
};
