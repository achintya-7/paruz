import { useTheme } from "../themes/ThemeContext.js";

interface StatusBarProps {
  status?: string;
  hints?: string;
}

export const StatusBar = ({
  status = "Ready",
  hints = "[↑↓] Navigate  [Enter] Install  [Esc] Clear  [q] Quit",
}: StatusBarProps) => {
  const theme = useTheme();
  return (
    <box
      width="100%"
      height={1}
      backgroundColor={theme.statusBar}
      flexDirection="row"
      alignItems="center"
      paddingX={1}
    >
      <text fg={theme.accent}>{status}</text>
      <text fg={theme.textDim}> {hints}</text>
    </box>
  );
};
