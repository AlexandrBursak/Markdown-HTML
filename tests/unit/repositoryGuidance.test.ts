import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

async function findSymlinks(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) return [entryPath];
      if (entry.isDirectory()) return findSymlinks(entryPath);
      return [];
    }),
  );

  return nested.flat();
}

describe("repository guidance", () => {
  it("installs a self-contained RexSoft skill and documents real commands", async () => {
    const skillPath = ".agents/skills/rexsoft-frontend";
    const [skillStat, symlinks, agents, readme] = await Promise.all([
      lstat(`${skillPath}/SKILL.md`),
      findSymlinks(skillPath),
      readFile("AGENTS.md", "utf8"),
      readFile("README.md", "utf8"),
    ]);

    expect(skillStat.isFile()).toBe(true);
    expect(symlinks).toEqual([]);
    expect(agents).toContain("pnpm typecheck");
    expect(agents).toContain("pnpm test:browser");
    expect(readme).toContain("docker compose up --build");
  });
});
