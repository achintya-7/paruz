import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import { StatusBar } from "../components/StatusBar.js";
import { TitleBar } from "../components/TitleBar.js";
import type { Config } from "../lib/config.js";
import { themes } from "../themes/index.js";
import { useTheme } from "../themes/ThemeContext.js";

interface SettingsViewProps {
  config: Config;
  onSave: (updates: Partial<Config>) => Promise<void>;
  onClose: () => void;
}

const THEME_NAMES = Object.keys(themes);

const aurHelpers = ["paru", "yay"] as const;
const mirrorHelpers = ["rate-mirrors", "reflector"] as const;

const settings = ["aur_helper", "mirror_helper", "theme"] as const;
type SettingKey = (typeof settings)[number];

const LABELS: Record<SettingKey, string> = {
  aur_helper: "AUR Helper",
  mirror_helper: "Mirror Helper",
  theme: "Theme",
};

const OPTIONS: Record<SettingKey, readonly string[]> = {
  aur_helper: aurHelpers,
  mirror_helper: mirrorHelpers,
  theme: THEME_NAMES,
};

export const SettingsView = ({ config, onSave, onClose }: SettingsViewProps) => {
  const theme = useTheme();
  const [cursor, setCursor] = useState(0);
  const [draft, setDraft] = useState<Partial<Config>>({});

  const currentConfig = { ...config, ...draft };

  const cycleOption = (key: SettingKey, dir: 1 | -1) => {
    const opts = OPTIONS[key];
    const cur = opts.indexOf(currentConfig[key] as string);
    const next = (cur + dir + opts.length) % opts.length;
    setDraft((d) => ({ ...d, [key]: opts[next] }));
  };

  useKeyboard(async (key) => {
    switch (key.name) {
      case "down":
      case "j":
        setCursor((c) => Math.min(c + 1, settings.length - 1));
        return;
      case "up":
      case "k":
        setCursor((c) => Math.max(c - 1, 0));
        return;
      case "right":
      case "l":
        cycleOption(settings[cursor], 1);
        return;
      case "left":
      case "h":
        cycleOption(settings[cursor], -1);
        return;
      case "return":
        await onSave(draft);
        return;
      case "escape":
      case "q":
        onClose();
    }
  });

  return (
    <box width="100%" height="100%" flexDirection="column">
      <TitleBar title="paruz — Settings" />

      <box
        flexGrow={1}
        width="100%"
        flexDirection="column"
        backgroundColor={theme.titleBg}
        paddingX={2}
        paddingY={1}
      >
        {settings.map((key, i) => {
          const selected = i === cursor;
          const val = currentConfig[key] as string;
          const opts = OPTIONS[key];
          const idx = opts.indexOf(val);
          const hasPrev = idx > 0;
          const hasNext = idx < opts.length - 1;

          return (
            <box
              key={key}
              width="100%"
              height={3}
              flexDirection="row"
              alignItems="center"
              border={true}
              borderStyle="single"
              borderColor={selected ? theme.accent : theme.border}
              backgroundColor={theme.titleBg}
              marginY={0}
            >
              <text fg={selected ? theme.accent : theme.text} paddingX={2} width={20}>
                {LABELS[key]}
              </text>
              <text fg={theme.textDim}>{hasPrev ? "◀ " : "  "}</text>
              <text fg={selected ? theme.accent : theme.text}>{val}</text>
              <text fg={theme.textDim}>{hasNext ? " ▶" : "  "}</text>
            </box>
          );
        })}

        <box width="100%" height={2} />
        <text fg={theme.textDim}>[↑↓] Navigate [←→] Change [Enter] Save [Esc] Cancel</text>
      </box>

      <StatusBar status="Settings" hints="[Enter] Save  [Esc] Cancel" />
    </box>
  );
};
