import { useTheme } from "../themes/ThemeContext.js";

interface SearchBarProps {
  value: string;
  loading: boolean;
  onInput: (val: string) => void;
}

export const SearchBar = ({ value, loading, onInput }: SearchBarProps) => {
  const theme = useTheme();
  return (
    <box
      width="100%"
      height={3}
      border={true}
      borderStyle="single"
      borderColor={theme.accent}
      backgroundColor={theme.titleBg}
      flexDirection="row"
      alignItems="center"
      paddingX={1}
    >
      <text fg={theme.textDim}>Search: </text>
      <input
        flexGrow={1}
        focused={true}
        value={value}
        placeholder="type to search packages..."
        onInput={onInput}
      />
      {loading && <text fg={theme.accent}> ⠋</text>}
    </box>
  );
};
