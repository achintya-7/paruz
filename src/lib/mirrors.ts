import type { CliRenderer } from "@opentui/core";

export interface MirrorResult {
  success: boolean;
  message: string;
}

export const updateMirrors = async (
  renderer: CliRenderer,
  mirrorHelper: "rate-mirrors" | "reflector" = "rate-mirrors",
): Promise<MirrorResult> => {
  renderer.suspend();

  try {
    const cmd =
      mirrorHelper === "rate-mirrors"
        ? "rate-mirrors --save /etc/pacman.d/mirrorlist arch"
        : "reflector --latest 20 --sort rate --save /etc/pacman.d/mirrorlist";

    const proc = Bun.spawn(
      [
        "sh",
        "-c",
        `sudo ${cmd}; echo; echo '[Press any key to return to paruz...]'; read -n 1 -s -r`,
      ],
      { stdin: "inherit", stdout: "inherit", stderr: "inherit" },
    );
    const code = await proc.exited;

    renderer.resume();

    if (code === 0) {
      return { success: true, message: "Mirrors updated successfully" };
    }
    return { success: false, message: `Mirror update failed (exit ${code})` };
  } catch (e) {
    renderer.resume();
    return { success: false, message: String(e) };
  }
};
