"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "cardflow-theme";
const THEME_CHANGE_EVENT = "cardflow-theme-change";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialTheme(): Theme {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return getSystemTheme();
}

function getDocumentTheme(): Theme | null {
  if (typeof document === "undefined") {
    return null;
  }

  const theme = document.documentElement.dataset.theme;
  if (theme === "light" || theme === "dark") {
    return theme;
  }

  return null;
}

function getThemeSnapshot(): Theme {
  return getDocumentTheme() ?? getInitialTheme();
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

function subscribeTheme(onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => onStoreChange();

  mediaQuery.addEventListener("change", handleChange);
  window.addEventListener("storage", handleChange);
  window.addEventListener(THEME_CHANGE_EVENT, handleChange);

  return () => {
    mediaQuery.removeEventListener("change", handleChange);
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(THEME_CHANGE_EVENT, handleChange);
  };
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);

  useEffect(() => {
    const currentTheme = getDocumentTheme();
    if (currentTheme === theme) {
      return;
    }

    applyTheme(theme);
  }, [theme]);

  const isDarkTheme = theme === "dark";
  const buttonLabel = isDarkTheme ? "Mudar para tema claro" : "Mudar para tema escuro";

  function toggleTheme() {
    const nextTheme: Theme = isDarkTheme ? "light" : "dark";
    applyTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={buttonLabel}
      title={buttonLabel}
      className="fixed right-6 top-6 z-50 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {isDarkTheme ? "Tema claro" : "Tema escuro"}
    </button>
  );
}
