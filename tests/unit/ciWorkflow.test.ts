import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

describe("CI workflow", () => {
  it("runs the documented local quality gate", async () => {
    const [workflow, readme] = await Promise.all([
      readFile(".github/workflows/ci.yml", "utf8"),
      readFile("README.md", "utf8"),
    ]);

    const commands = [
      "pnpm typecheck",
      "pnpm lint",
      "pnpm test",
      "pnpm test:browser",
      "pnpm build",
    ];

    for (const command of commands) {
      expect(workflow).toContain(`run: ${command}`);
      expect(readme).toContain(command);
    }
  });

  it("installs and configures the accepted desktop and mobile browser matrix", async () => {
    const [workflow, playwrightConfig] = await Promise.all([
      readFile(".github/workflows/ci.yml", "utf8"),
      readFile("playwright.config.ts", "utf8"),
    ]);

    expect(workflow).toContain(
      "pnpm exec playwright install --with-deps chromium firefox webkit msedge",
    );
    for (const project of [
      "desktop-chrome",
      "desktop-firefox",
      "desktop-safari",
      "desktop-edge",
      "mobile-chrome",
      "mobile-safari",
    ]) {
      expect(playwrightConfig).toContain(`name: \"${project}\"`);
    }
  });
});
