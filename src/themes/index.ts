export interface Theme {
  titleBg: string;
  titleFg: string;
  border: string;
  accent: string;
  error: string;
  statusBar: string;
  text: string;
  textDim: string;
}

export const themes: Record<string, Theme> = {
  "ayu-dark": {
    titleBg: "#0d1017",
    titleFg: "#e6b450",
    border: "#3d424d",
    accent: "#e6b450",
    error: "#ff3333",
    statusBar: "#131721",
    text: "#bfbdb6",
    textDim: "#5c6773",
  },
  dracula: {
    titleBg: "#282a36",
    titleFg: "#bd93f9",
    border: "#44475a",
    accent: "#ff79c6",
    error: "#ff5555",
    statusBar: "#21222c",
    text: "#f8f8f2",
    textDim: "#6272a4",
  },
  nord: {
    titleBg: "#2e3440",
    titleFg: "#88c0d0",
    border: "#3b4252",
    accent: "#81a1c1",
    error: "#bf616a",
    statusBar: "#242933",
    text: "#d8dee9",
    textDim: "#4c566a",
  },
  catppuccin: {
    titleBg: "#1e1e2e",
    titleFg: "#cba6f7",
    border: "#313244",
    accent: "#89b4fa",
    error: "#f38ba8",
    statusBar: "#181825",
    text: "#cdd6f4",
    textDim: "#585b70",
  },
  gruvbox: {
    titleBg: "#282828",
    titleFg: "#d79921",
    border: "#3c3836",
    accent: "#b8bb26",
    error: "#cc241d",
    statusBar: "#1d2021",
    text: "#ebdbb2",
    textDim: "#928374",
  },
};

export const defaultTheme = themes["ayu-dark"];
