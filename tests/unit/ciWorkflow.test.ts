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

  it("runs the full performance profile on schedule and manual demand", async () => {
    const [workflow, packageJson, performanceTest] = await Promise.all([
      readFile(".github/workflows/performance.yml", "utf8"),
      readFile("package.json", "utf8"),
      readFile("tests/browser/converter-performance.spec.ts", "utf8"),
    ]);

    expect(workflow).toContain("schedule:");
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("run: pnpm test:performance");
    expect(packageJson).toContain('"test:performance"');
    expect(performanceTest).toContain('process.env.PERFORMANCE_RUN === "full"');
    expect(performanceTest).toContain("600_000");
    expect(performanceTest).toContain("coldLoadCount = fullRun ? 30 : 1");
  });

  it("isolates performance profiles and hydrates the converter before sampling", async () => {
    const performanceTest = await readFile(
      "tests/browser/converter-performance.spec.ts",
      "utf8",
    );

    expect(performanceTest).toContain('test.describe.configure({ mode: "serial" })');
    expect(performanceTest).toContain('testInfo.project.name !== "desktop-chrome"');
    expect(performanceTest).toContain('await editor.fill("warmup")');
    expect(performanceTest).toContain('await expect(output).toHaveValue("<p>warmup</p>")');
  });
});
