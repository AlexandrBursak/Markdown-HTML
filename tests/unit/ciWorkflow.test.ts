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
});
