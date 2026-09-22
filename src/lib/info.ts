import { type BackendId, detectBackend } from "./backend.js";

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

interface BrewFormula {
  name?: string;
  full_name?: string;
  desc?: string;
  homepage?: string;
  license?: string;
  tap?: string;
  versions?: { stable?: string };
  version?: string;
  dependencies?: string[];
  depends_on?: Record<string, unknown>;
  conflicts_with?: string[];
  installed?: { version?: string }[];
}

const parseBrewInfo = (stdout: string, name: string): Partial<PackageInfo> => {
  const parsed = JSON.parse(stdout) as { formulae?: BrewFormula[]; casks?: BrewFormula[] };
  const formula = parsed.formulae?.[0];
  const cask = parsed.casks?.[0];
  const entry = formula ?? cask;
  if (!entry) return { name };

  const version = formula ? (entry.versions?.stable ?? "") : (entry.version ?? "");
  // Casks express dependencies as an object keyed by type; formulae as a plain list.
  const depends = formula
    ? (entry.dependencies ?? []).join("  ")
    : Object.values(entry.depends_on ?? {})
        .flatMap((v) => (Array.isArray(v) ? v : []))
        .filter((v): v is string => typeof v === "string")
        .join("  ");

  return {
    name: entry.full_name ?? entry.name ?? name,
    version,
    description: entry.desc ?? "",
    repo: cask ? `${entry.tap ?? "homebrew/cask"} (cask)` : (entry.tap ?? "homebrew/core"),
    url: entry.homepage ?? "",
    licenses: entry.license ?? "",
    depends,
    conflicts: (entry.conflicts_with ?? []).join("  "),
  };
};

export const getPackageInfo = async (
  name: string,
  aurHelper: "paru" | "yay" = "paru",
  backend: BackendId = detectBackend(),
): Promise<Partial<PackageInfo>> => {
  try {
    const cmd = backend === "brew" ? ["brew", "info", "--json=v2", name] : [aurHelper, "-Si", name];
    const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
    const stdout = await new Response(proc.stdout).text();
    await proc.exited;
    return backend === "brew" ? parseBrewInfo(stdout, name) : parseInfoOutput(stdout);
  } catch {
    return { name };
  }
};
