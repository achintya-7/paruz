import { useState, useEffect } from "react";
import { useKeyboard } from "@opentui/react";
import { ThemeContext } from "./themes/ThemeContext.js";
import { themes, defaultTheme } from "./themes/index.js";
import { useConfig } from "./hooks/useConfig.js";
import { resolveTheme } from "./lib/config.js";
import { SearchView } from "./views/SearchView.js";
import { SettingsView } from "./views/SettingsView.js";
import type { Theme } from "./themes/index.js";

type View = "search" | "settings";

export const App = () => {
  const { config, loading, updateConfig } = useConfig();
  const [view, setView] = useState<View>("search");
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    if (!config) return;
    const load = async () => {
      const t = await resolveTheme(config.theme);
      setTheme(t);
    };
    load();
  }, [config?.theme]);

  useKeyboard((key) => {
    if (key.name === "q" && view === "search") process.exit(0);
    if (key.name === "," && view === "search") setView("settings");
    if (key.name === "escape" && view === "settings") setView("search");
  });

  if (loading || !config) {
    return (
      <box width="100%" height="100%" alignItems="center" justifyContent="center">
        <text>Loading...</text>
      </box>
    );
  }

  return (
    <ThemeContext.Provider value={theme}>
      <box width="100%" height="100%" flexDirection="column">
        {view === "search" && (
          <SearchView config={config} onOpenSettings={() => setView("settings")} />
        )}
        {view === "settings" && (
          <SettingsView
            config={config}
            onSave={async (updates) => {
              await updateConfig(updates);
              setView("search");
            }}
            onClose={() => setView("search")}
          />
        )}
      </box>
    </ThemeContext.Provider>
  );
};
