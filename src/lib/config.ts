import { parse, stringify } from "smol-toml";
import { join } from "path";
import { homedir } from "os";
import { themes, type Theme } from "../themes/index.js";

export interface Config {
  aur_helper: "paru" | "yay";
  mirror_helper: "rate-mirrors" | "reflector";
  theme: string;
}

const DEFAULT_CONFIG: Config = {
  aur_helper: "paru",
  mirror_helper: "rate-mirrors",
  theme: "ayu-dark",
};

const CONFIG_DIR = join(homedir(), ".config", "paruz");
const CONFIG_PATH = join(CONFIG_DIR, "config.toml");
const THEMES_PATH = join(CONFIG_DIR, "themes.toml");

const ensureConfigDir = async () => {
  try {
    await Bun.$`mkdir -p ${CONFIG_DIR}`.quiet();
  } catch {}
};

const detectAurHelper = async (): Promise<"paru" | "yay"> => {
  for (const helper of ["paru", "yay"] as const) {
    try {
      const proc = Bun.spawn(["which", helper], { stdout: "pipe", stderr: "pipe" });
      const code = await proc.exited;
      if (code === 0) return helper;
    } catch {}
  }
  return "paru"; // default, will error at runtime with a clear message
};

export const loadConfig = async (): Promise<Config> => {
  await ensureConfigDir();

  const file = Bun.file(CONFIG_PATH);
  if (!(await file.exists())) {
    const aur_helper = await detectAurHelper();
    const defaults = { ...DEFAULT_CONFIG, aur_helper };
    await Bun.write(CONFIG_PATH, stringify(defaults as any));
    return defaults;
  }

  const raw = await file.text();
  const parsed = parse(raw) as Partial<Config>;
  return { ...DEFAULT_CONFIG, ...parsed };
};

export const saveConfig = async (config: Config): Promise<void> => {
  await ensureConfigDir();
  await Bun.write(CONFIG_PATH, stringify(config as any));
};

export const loadCustomThemes = async (): Promise<Record<string, Theme>> => {
  const file = Bun.file(THEMES_PATH);
  if (!(await file.exists())) return {};

  try {
    const raw = await file.text();
    return parse(raw) as unknown as Record<string, Theme>;
  } catch {
    return {};
  }
};

export const resolveTheme = async (themeName: string): Promise<Theme> => {
  const custom = await loadCustomThemes();
  const all = { ...themes, ...custom };
  return all[themeName] ?? themes["ayu-dark"];
};
