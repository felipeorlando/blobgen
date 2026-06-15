export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "blobgen-theme";

/** Whether the given theme resolves to dark right now (uses the OS preference for "system"). */
export function resolveDark(theme: Theme): boolean {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return theme === "dark";
}

/** Apply the resolved theme to <html>: toggles the `dark` class and `color-scheme`. */
export function applyTheme(theme: Theme): "light" | "dark" {
  const dark = resolveDark(theme);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  return dark ? "dark" : "light";
}

/**
 * Inline script injected into <head> before paint to set the correct theme,
 * preventing a flash of the wrong colors on first load. Mirrors resolveDark/applyTheme.
 */
export const themeScript = `(function(){try{var k=${JSON.stringify(
  THEME_STORAGE_KEY,
)};var t=localStorage.getItem(k)||"system";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
