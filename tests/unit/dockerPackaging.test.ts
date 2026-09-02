import { spawnSync } from "node:child_process";
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("Docker packaging", () => {
  it("defines one healthy, bounded web service and a non-root runtime", async () => {
    const [compose, productionCompose, dockerfile, entrypoint] = await Promise.all([
      readFile("compose.yml", "utf8"),
      readFile("compose.production.yml", "utf8"),
      readFile("docker/Dockerfile", "utf8"),
      readFile("docker/entrypoint.sh", "utf8"),
    ]);

    expect(compose).toMatch(/^services:\n  web:/);
    expect(compose).not.toMatch(/^  (db|database|postgres|redis):/m);
    expect(compose).not.toContain('user: "${USER_ID:-1000}:${GROUP_ID:-1000}"');
    expect(compose).toContain("healthcheck:");
    expect(compose).toContain("start_period: 90s");
    expect(compose).toContain("max-size:");
    expect(compose).toContain("restart: unless-stopped");
    expect(productionCompose).toContain("target: runner");
    expect(productionCompose).toContain("NODE_ENV: production");
    expect(productionCompose).not.toContain("pnpm dev");
    expect(productionCompose).not.toContain("volumes:");
    expect(dockerfile).toContain("USER nextjs");
    expect(dockerfile).toContain("FROM node:22-alpine AS runner");
    expect(dockerfile).toContain("RUN apk add --no-cache su-exec");
    expect(dockerfile).toContain("chown -R node:node /home/node/app/node_modules /pnpm");
    expect(entrypoint).toContain('exec "$@"');
    expect(entrypoint).toContain('exec su-exec node "$@"');
  });

  it("reconciles the dependency volume in development and skips installs in production", async () => {
    const fixture = await mkdtemp(join(tmpdir(), "markdown-html-entrypoint-"));
    const binDirectory = join(fixture, "bin");
    const fakePnpm = join(binDirectory, "pnpm");
    const developmentLog = join(fixture, "development.log");
    const productionLog = join(fixture, "production.log");

    try {
      await mkdir(binDirectory);
      await writeFile(fakePnpm, '#!/bin/sh\nprintf "pnpm:%s\\n" "$*" >> "$LOG_PATH"\n');
      await chmod(fakePnpm, 0o755);

      for (const [nodeEnv, logPath] of [
        ["development", developmentLog],
        ["production", productionLog],
      ] as const) {
        const result = spawnSync(
          "/bin/sh",
          ["docker/entrypoint.sh", "/bin/sh", "-c", 'printf "target\\n" >> "$LOG_PATH"'],
          {
            encoding: "utf8",
            env: {
              ...process.env,
              LOG_PATH: logPath,
              NODE_ENV: nodeEnv,
              PATH: `${binDirectory}:${process.env.PATH ?? ""}`,
            },
          },
        );
        expect(result.status, result.stderr).toBe(0);
      }

      await expect(readFile(developmentLog, "utf8")).resolves.toBe(
        "pnpm:install --frozen-lockfile\ntarget\n",
      );
      await expect(readFile(productionLog, "utf8")).resolves.toBe("target\n");
    } finally {
      await rm(fixture, { force: true, recursive: true });
    }
  });
});
