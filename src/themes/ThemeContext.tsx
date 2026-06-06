import { createContext, useContext } from "react";
import { defaultTheme, type Theme } from "./index.js";

export const ThemeContext = createContext<Theme>(defaultTheme);

export const useTheme = () => useContext(ThemeContext);
