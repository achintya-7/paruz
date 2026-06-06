import { useAppContext, useKeyboard } from "@opentui/react";
import { useState } from "react";
import { PackageDetail } from "../components/PackageDetail.js";
import { PackageList } from "../components/PackageList.js";
import { SearchBar } from "../components/SearchBar.js";
import { StatusBar } from "../components/StatusBar.js";
import { TitleBar } from "../components/TitleBar.js";
import { refreshCache, usePackageSearch } from "../hooks/usePackageSearch.js";
import type { Config } from "../lib/config.js";
import { installPackage } from "../lib/install.js";
import { updateMirrors } from "../lib/mirrors.js";
import { useTheme } from "../themes/ThemeContext.js";

interface SearchViewProps {
  config: Config;
  onOpenSettings: () => void;
}

export const SearchView = ({ config, onOpenSettings }: SearchViewProps) => {
  const theme = useTheme();
  const { renderer } = useAppContext();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  const { packages, loading } = usePackageSearch(query);
  const selectedPkg = packages[selectedIndex] ?? null;

  const statusText = (() => {
    if (status) return status;
    if (loading) return "Building cache...";
    if (packages.length > 0) return `${packages.length} results`;
    if (query) return "No results";
    return "Ready";
  })();

  useKeyboard((key) => {
    switch (key.name) {
      case "down":
        setSelectedIndex((i: number) => Math.min(i + 1, packages.length - 1));
        return;
      case "up":
        setSelectedIndex((i: number) => Math.max(i - 1, 0));
        return;
      case "return":
        if (!selectedPkg || !renderer) return;
        (async () => {
          setStatus(`Installing ${selectedPkg.name}...`);
          const result = await installPackage(selectedPkg.name, renderer, config.aur_helper);
          setStatus(result.message);
          setTimeout(() => setStatus(null), 3000);
        })();
        return;
      case "r":
        if (!key.ctrl) return;
        (async () => {
          setStatus("Refreshing cache...");
          await refreshCache();
          setStatus("Cache refreshed");
          setTimeout(() => setStatus(null), 2000);
        })();
        return;
      case "u":
        if (!key.ctrl || !renderer) return;
        (async () => {
          setStatus("Updating mirrors...");
          const result = await updateMirrors(renderer, config.mirror_helper);
          setStatus(result.message);
          setTimeout(() => setStatus(null), 3000);
        })();
        return;
      case ",":
        onOpenSettings();
        return;
      case "escape":
        setQuery("");
        setSelectedIndex(0);
    }
  });

  return (
    <box width="100%" height="100%" flexDirection="column">
      <TitleBar title={`paruz (${packages.length} results)`} />
      <SearchBar
        value={query}
        loading={loading}
        onInput={(val) => {
          setQuery(val);
          setSelectedIndex(0);
        }}
      />

      <box flexGrow={1} width="100%" flexDirection="row">
        <box
          flexGrow={1}
          height="100%"
          border={true}
          borderStyle="single"
          borderColor={theme.accent}
          title=" Packages "
          backgroundColor={theme.titleBg}
        >
          <PackageList packages={packages} selectedIndex={selectedIndex} query={query} />
        </box>

        <box
          flexGrow={1}
          height="100%"
          border={true}
          borderStyle="single"
          borderColor={theme.border}
          title=" Details "
          backgroundColor={theme.titleBg}
        >
          <PackageDetail pkg={selectedPkg} aurHelper={config.aur_helper} />
        </box>
      </box>

      <StatusBar
        status={statusText}
        hints="[↑↓] Navigate  [Enter] Install  [Ctrl+U] Mirrors  [Ctrl+R] Refresh Cache  [,] Settings  [q] Quit"
      />
    </box>
  );
};
