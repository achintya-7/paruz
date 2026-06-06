import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react/renderer";
import { App } from "./app.js";

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  clearOnShutdown: true,
});

createRoot(renderer).render(<App />);
