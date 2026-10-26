import { describe, expect, it } from "vitest";

import { readThemePreference, resolveTheme, writeThemePreference } from "@/shared/browser/themePreference";

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
    values,
  };
}

describe("theme preference", () => {
  it("defaults to following the system when nothing valid is stored", () => {
    expect(readThemePreference(memoryStorage())).toBe("system");
    expect(readThemePreference(memoryStorage({ "markdown-html:theme": "sepia" }))).toBe("system");
    expect(readThemePreference(undefined)).toBe("system");
  });

  it("round-trips an explicit choice and forgets it when returning to system", () => {
    const storage = memoryStorage();
    writeThemePreference("light", storage);
    expect(readThemePreference(storage)).toBe("light");
    writeThemePreference("system", storage);
    expect(storage.values.has("markdown-html:theme")).toBe(false);
  });

  it("survives storage that throws", () => {
    const broken = {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("blocked"); },
      removeItem: () => { throw new Error("blocked"); },
    };
    expect(readThemePreference(broken)).toBe("system");
    expect(() => writeThemePreference("dark", broken)).not.toThrow();
  });

  it("resolves system against the OS preference and keeps explicit choices", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
});

describe("theme boot script", () => {
  it("applies the stored choice before React loads", async () => {
    const { themeBootScript } = await import("@/shared/browser/themePreference");
    window.localStorage.setItem("markdown-html:theme", "light");
    delete document.documentElement.dataset.theme;

    new Function(themeBootScript)();

    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    window.localStorage.clear();
  });
});
