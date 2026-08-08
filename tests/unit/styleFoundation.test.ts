import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

describe("CSS foundation", () => {
  it("centralizes neutral tokens and proves CSS Module wiring", async () => {
    const [globals, pageModule, page] = await Promise.all([
      readFile("src/app/globals.css", "utf8"),
      readFile("src/app/HomePage.module.css", "utf8"),
      readFile("src/app/page.tsx", "utf8"),
    ]);

    expect(globals).toContain("--color-canvas:");
    expect(globals).toContain("--color-text:");
    expect(globals).not.toMatch(/#[0-9a-f]{3,8}|rgba?\(/i);
    expect(pageModule).toContain("var(--color-canvas)");
    expect(page).toContain('import styles from "./HomePage.module.css"');
  });
});
