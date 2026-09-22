import { platform } from "node:os";

export type BackendId = "arch" | "brew";

/** Which package backend this machine should drive. macOS → Homebrew, everything else → Arch. */
export const detectBackend = (): BackendId => (platform() === "darwin" ? "brew" : "arch");

export const backendLabel = (backend: BackendId): string =>
  backend === "brew" ? "Homebrew package manager" : "Arch Linux package manager";

/** Label for the Ctrl+U maintenance action — mirrorlist on Arch, update+upgrade on brew. */
export const maintenanceLabel = (backend: BackendId): string =>
  backend === "brew" ? "Upgrade" : "Mirrors";
