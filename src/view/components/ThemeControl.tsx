"use client";

import { useEffect, useState } from "react";

import {
  readThemePreference,
  resolveTheme,
  writeThemePreference,
  type ThemePreference,
} from "@/shared/browser/themePreference";

import styles from "./ThemeControl.module.css";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const DARK_QUERY = "(prefers-color-scheme: dark)";

function applyTheme(preference: ThemePreference): void {
  const prefersDark = window.matchMedia?.(DARK_QUERY).matches ?? false;
  document.documentElement.dataset.theme = resolveTheme(preference, prefersDark);
}

export function ThemeControl() {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    // Read after hydration: the server cannot know the stored choice.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreference(readThemePreference());
  }, []);

  useEffect(() => {
    if (preference !== "system" || !window.matchMedia) return;
    const query = window.matchMedia(DARK_QUERY);
    const follow = () => applyTheme("system");
    query.addEventListener("change", follow);
    return () => query.removeEventListener("change", follow);
  }, [preference]);

  function choose(next: ThemePreference): void {
    setPreference(next);
    writeThemePreference(next);
    applyTheme(next);
  }

  return (
    <fieldset className={styles.control}>
      <legend className="sr-only">Theme</legend>
      <div className={styles.options}>
        {OPTIONS.map(({ value, label }) => (
          <label key={value} className={styles.option}>
            <input
              type="radio"
              name="theme"
              checked={preference === value}
              onChange={() => choose(value)}
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
