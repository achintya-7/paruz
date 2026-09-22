import type { CliRenderer } from "@opentui/core";
import { type BackendId, detectBackend } from "./backend.js";

export interface MirrorResult {
  success: boolean;
  message: string;
}

/**
 * The Ctrl+U maintenance action. On Arch this re-rates the pacman mirrorlist;
 * on Homebrew there are no mirrors, so it updates and upgrades instead.
 */
export const updateMirrors = async (
  renderer: CliRenderer,
  mirrorHelper: "rate-mirrors" | "reflector" = "rate-mirrors",
  backend: BackendId = detectBackend(),
): Promise<MirrorResult> => {
  renderer.suspend();

  const isBrew = backend === "brew";

  try {
    const cmd = isBrew
      ? "brew update && brew upgrade"
      : mirrorHelper === "rate-mirrors"
        ? "sudo rate-mirrors --save /etc/pacman.d/mirrorlist arch"
        : "sudo reflector --latest 20 --sort rate --save /etc/pacman.d/mirrorlist";

    const proc = Bun.spawn(
      ["sh", "-c", `${cmd}; echo; echo '[Press any key to return to paruz...]'; read -n 1 -s -r`],
      { stdin: "inherit", stdout: "inherit", stderr: "inherit" },
    );
    const code = await proc.exited;

    renderer.resume();

    if (code === 0) {
      return {
        success: true,
        message: isBrew ? "Packages upgraded" : "Mirrors updated successfully",
      };
    }
    return {
      success: false,
      message: isBrew ? `Upgrade failed (exit ${code})` : `Mirror update failed (exit ${code})`,
    };
  } catch (e) {
    renderer.resume();
    return { success: false, message: String(e) };
  }
};
