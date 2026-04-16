import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark";

const THEME_KEY = "nabra_theme_mode";

export interface ThemeColors {
  mode: ThemeMode;
  bg: string;
  bgElevated: string;
  card: string;
  cardAlt: string;
  border: string;
  borderStrong: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textDim: string;
  primary: string;
  primaryText: string;
  danger: string;
  success: string;
  accent: string;
  overlay: string;
  inputBg: string;
  inputText: string;
  placeholder: string;
  inverse: string;
}

const DARK: ThemeColors = {
  mode: "dark",
  bg: "#000000",
  bgElevated: "#0A0A0A",
  card: "#141414",
  cardAlt: "#1A1A1A",
  border: "#1F1F1F",
  borderStrong: "#2A2A2A",
  text: "#FFFFFF",
  textSecondary: "#E5E5E5",
  textMuted: "#9CA3AF",
  textDim: "#6B7280",
  primary: "#E5E5E5",
  primaryText: "#000000",
  danger: "#EF4444",
  success: "#22C55E",
  accent: "#8B5CF6",
  overlay: "rgba(0,0,0,0.7)",
  inputBg: "#141414",
  inputText: "#E5E5E5",
  placeholder: "#4B5563",
  inverse: "#FFFFFF",
};

const LIGHT: ThemeColors = {
  mode: "light",
  bg: "#FFFFFF",
  bgElevated: "#FAFAFA",
  card: "#F5F5F5",
  cardAlt: "#EEEEEE",
  border: "#E5E7EB",
  borderStrong: "#D1D5DB",
  text: "#000000",
  textSecondary: "#1F2937",
  textMuted: "#4B5563",
  textDim: "#6B7280",
  primary: "#1F2937",
  primaryText: "#FFFFFF",
  danger: "#DC2626",
  success: "#16A34A",
  accent: "#7C3AED",
  overlay: "rgba(0,0,0,0.5)",
  inputBg: "#F3F4F6",
  inputText: "#111827",
  placeholder: "#9CA3AF",
  inverse: "#000000",
};

let _mode: ThemeMode = "dark";
let _listeners: ((mode: ThemeMode) => void)[] = [];

export function getColors(mode: ThemeMode = _mode): ThemeColors {
  return mode === "light" ? LIGHT : DARK;
}

export function getThemeMode(): ThemeMode {
  return _mode;
}

export async function initTheme(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(THEME_KEY);
    if (raw === "light" || raw === "dark") {
      _mode = raw;
    }
  } catch {}
}

export async function setThemeMode(mode: ThemeMode): Promise<void> {
  _mode = mode;
  await AsyncStorage.setItem(THEME_KEY, mode);
  _listeners.forEach((fn) => fn(mode));
}

export async function toggleTheme(): Promise<ThemeMode> {
  const next: ThemeMode = _mode === "dark" ? "light" : "dark";
  await setThemeMode(next);
  return next;
}

export function useTheme(): { mode: ThemeMode; colors: ThemeColors; toggle: () => void } {
  const [mode, setMode] = useState<ThemeMode>(_mode);

  useEffect(() => {
    const listener = (m: ThemeMode) => setMode(m);
    _listeners.push(listener);
    setMode(_mode);
    return () => {
      _listeners = _listeners.filter((l) => l !== listener);
    };
  }, []);

  return {
    mode,
    colors: getColors(mode),
    toggle: () => {
      toggleTheme();
    },
  };
}

export function getLogo(mode: ThemeMode = _mode) {
  return mode === "light"
    ? require("../assets/logo-black.png")
    : require("../assets/logo-white.png");
}
