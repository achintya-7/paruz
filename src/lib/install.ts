import type { CliRenderer } from "@opentui/core";

export interface InstallResult {
  success: boolean;
  message: string;
}

export const installPackage = async (
  name: string,
  renderer: CliRenderer,
  aurHelper: "paru" | "yay" = "paru",
): Promise<InstallResult> => {
  renderer.suspend();

  try {
    // Run paru in the foreground — sudo prompts and confirmations work normally
    const proc = Bun.spawn(
      [
        "sh",
        "-c",
        `${aurHelper} -S ${name}; echo; echo '[Press any key to return to paruz...]'; read -n 1 -s -r`,
      ],
      { stdin: "inherit", stdout: "inherit", stderr: "inherit" },
    );
    const code = await proc.exited;

    renderer.resume();

    if (code === 0) {
      return { success: true, message: `${name} installed successfully` };
    }
    return { success: false, message: `Install failed (exit ${code})` };
  } catch (e) {
    renderer.resume();
    return { success: false, message: String(e) };
  }
};

export const removePackage = async (
  name: string,
  renderer: CliRenderer,
  aurHelper: "paru" | "yay" = "paru",
): Promise<InstallResult> => {
  renderer.suspend();

  try {
    const proc = Bun.spawn(
      [
        "sh",
        "-c",
        `${aurHelper} -R ${name}; echo; echo '[Press any key to return to paruz...]'; read -n 1 -s -r`,
      ],
      { stdin: "inherit", stdout: "inherit", stderr: "inherit" },
    );
    const code = await proc.exited;

    renderer.resume();

    if (code === 0) {
      return { success: true, message: `${name} removed successfully` };
    }
    return { success: false, message: `Remove failed (exit ${code})` };
  } catch (e) {
    renderer.resume();
    return { success: false, message: String(e) };
  }
};
