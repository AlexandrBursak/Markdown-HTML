import { defineConfig, devices } from "@playwright/test";

const fullPerformanceRun = process.env.PERFORMANCE_RUN === "full";

const desktopChrome = {
  name: "desktop-chrome",
  use: { ...devices["Desktop Chrome"], channel: "chrome" },
};

const browserMatrix = [
  desktopChrome,
  { name: "desktop-firefox", use: { ...devices["Desktop Firefox"] } },
  { name: "desktop-safari", use: { ...devices["Desktop Safari"] } },
  { name: "desktop-edge", use: { ...devices["Desktop Edge"], channel: "msedge" } },
  { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
  { name: "mobile-safari", use: { ...devices["iPhone 15"] } },
];

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  projects: process.env.CI ? browserMatrix : [desktopChrome],
  webServer: {
    command: fullPerformanceRun
      ? "pnpm start --hostname 127.0.0.1 --port 4173"
      : "pnpm dev --hostname 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
});
