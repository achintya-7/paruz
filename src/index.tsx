import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react/renderer";
import pkg from "../package.json" with { type: "json" };
import { App } from "./app.js";
import { backendLabel, detectBackend } from "./lib/backend.js";

const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  console.log(`paruz ${pkg.version}`);
  process.exit(0);
}

if (args.includes("--help") || args.includes("-h")) {
  console.log(`paruz ${pkg.version} — ${backendLabel(detectBackend())}

Usage: paruz [options]

Options:
  -h, --help     Show this help
  -v, --version  Show version

Run with no arguments to start the TUI. Type to search, ↑↓ to navigate,
Enter to install, , for settings, q to quit.`);
  process.exit(0);
}

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  clearOnShutdown: true,
});

createRoot(renderer).render(<App />);
