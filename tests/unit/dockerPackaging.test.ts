import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

describe("Docker packaging", () => {
  it("defines one healthy, bounded web service and a non-root runtime", async () => {
    const [compose, dockerfile, entrypoint] = await Promise.all([
      readFile("compose.yml", "utf8"),
      readFile("docker/Dockerfile", "utf8"),
      readFile("docker/entrypoint.sh", "utf8"),
    ]);

    expect(compose).toMatch(/^services:\n  web:/);
    expect(compose).not.toMatch(/^  (db|database|postgres|redis):/m);
    expect(compose).toContain("healthcheck:");
    expect(compose).toContain("max-size:");
    expect(dockerfile).toContain("USER nextjs");
    expect(dockerfile).toContain("FROM node:22-alpine AS runner");
    expect(entrypoint).toContain('exec "$@"');
  });
});
