import { useTheme } from "../themes/ThemeContext.js";

interface TitleBarProps {
  title?: string;
}

export const TitleBar = ({ title = "paruz" }: TitleBarProps) => {
  const theme = useTheme();
  return (
    <box
      width="100%"
      height={3}
      backgroundColor={theme.titleBg}
      border={true}
      borderStyle="single"
      borderColor={theme.accent}
      flexDirection="row"
      alignItems="center"
      paddingX={1}
    >
      <text fg={theme.accent}>{title}</text>
      <text fg={theme.textDim}> — Arch Linux package manager</text>
    </box>
  );
};
