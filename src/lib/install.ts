import type { CliRenderer } from "@opentui/core";
import { type BackendId, detectBackend } from "./backend.js";

export interface InstallResult {
  success: boolean;
  message: string;
}

// Run an interactive package-manager command with the TUI suspended, so sudo prompts
// and confirmations behave exactly as they would in a bare shell.
const runInForeground = async (
  command: string,
  renderer: CliRenderer,
  onSuccess: string,
  onFailure: (code: number) => string,
): Promise<InstallResult> => {
  renderer.suspend();

  try {
    const proc = Bun.spawn(
      [
        "sh",
        "-c",
        `${command}; echo; echo '[Press any key to return to paruz...]'; read -n 1 -s -r`,
      ],
      { stdin: "inherit", stdout: "inherit", stderr: "inherit" },
    );
    const code = await proc.exited;

    renderer.resume();

    if (code === 0) return { success: true, message: onSuccess };
    return { success: false, message: onFailure(code) };
  } catch (e) {
    renderer.resume();
    return { success: false, message: String(e) };
  }
};

export const installPackage = async (
  name: string,
  renderer: CliRenderer,
  aurHelper: "paru" | "yay" = "paru",
  backend: BackendId = detectBackend(),
): Promise<InstallResult> => {
  // brew resolves formulae and casks itself and must never run under sudo.
  const command = backend === "brew" ? `brew install ${name}` : `${aurHelper} -S ${name}`;
  return runInForeground(
    command,
    renderer,
    `${name} installed successfully`,
    (code) => `Install failed (exit ${code})`,
  );
};

export const removePackage = async (
  name: string,
  renderer: CliRenderer,
  aurHelper: "paru" | "yay" = "paru",
  backend: BackendId = detectBackend(),
): Promise<InstallResult> => {
  const command = backend === "brew" ? `brew uninstall ${name}` : `${aurHelper} -R ${name}`;
  return runInForeground(
    command,
    renderer,
    `${name} removed successfully`,
    (code) => `Remove failed (exit ${code})`,
  );
};
