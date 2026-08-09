import { expect, test } from "@playwright/test";

import { gotoConverter, waitForConverter } from "./helpers/converter";

const fullRun = process.env.PERFORMANCE_RUN === "full";
const conversionRunMs = fullRun ? 600_000 : 5_000;
const coldLoadCount = fullRun ? 30 : 1;

test.describe.configure({ mode: "serial" });
test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-chrome",
    "Performance budgets use the canonical desktop Chrome profile",
  );
});

function percentile95(samples: number[]): number {
  return [...samples].sort((a, b) => a - b)[Math.ceil(samples.length * 0.95) - 1] ?? Infinity;
}

test("converts documents through 100,000 code points within the p95 budget", async ({ page }) => {
  test.setTimeout(fullRun ? 660_000 : 30_000);
  await gotoConverter(page);
  const editor = page.getByRole("textbox", { name: "Markdown" });
  const output = page.getByRole("textbox", { name: "Generated HTML" });
  await editor.fill("warmup");
  await expect(output).toHaveValue("<p>warmup</p>");
  const samples = await editor.evaluate(async (element, { durationMs }) => {
    const textarea = element as HTMLTextAreaElement;
    const generated = document.querySelector<HTMLTextAreaElement>(
      'textarea[aria-label="Generated HTML"]',
    );
    const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
    if (!setValue || !generated) throw new Error("Converter textarea unavailable");
    const timings: number[] = [];
    const sizes = [1_000, 10_000, 99_990];
    const runStarted = performance.now();
    let index = 0;

    while (performance.now() - runStarted < durationMs) {
      const marker = `-${index}`;
      const markdown = `${"a".repeat(sizes[index % sizes.length] ?? 1_000)}${marker}`;
      setValue.call(textarea, markdown);
      const started = performance.now();
      textarea.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: null }));
      while (!generated.value.endsWith(`${marker}</p>`)) {
        await new Promise(requestAnimationFrame);
      }
      timings.push(performance.now() - started);
      index += 1;
      const remaining = 250 - (performance.now() - started);
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
    }
    return timings;
  }, { durationMs: conversionRunMs });
  await expect(output).not.toHaveValue("");
  expect(samples.length).toBeGreaterThanOrEqual(fullRun ? 2_300 : 20);
  expect(percentile95(samples)).toBeLessThanOrEqual(100);
});

test("makes cold converter loads usable within two seconds", async ({ page, browserName }) => {
  test.setTimeout(fullRun ? 180_000 : 30_000);
  test.skip(browserName !== "chromium", "Network and CPU profiles use Chromium CDP");
  const session = await page.context().newCDPSession(page);
  await session.send("Network.enable");
  await session.send("Network.setCacheDisabled", { cacheDisabled: true });
  await session.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 100,
    downloadThroughput: (10 * 1024 * 1024) / 8,
    uploadThroughput: (10 * 1024 * 1024) / 8,
  });
  await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  const samples: number[] = [];
  for (let index = 0; index < coldLoadCount; index += 1) {
    const started = performance.now();
    await page.goto(`/?cold=${index}`, { waitUntil: "domcontentloaded" });
    await waitForConverter(page);
    await expect(page.getByRole("textbox", { name: "Markdown" })).toBeEditable();
    await expect(page.getByRole("region", { name: "Preview" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Generated HTML" })).toBeVisible();
    samples.push(performance.now() - started);
  }

  expect(percentile95(samples)).toBeLessThanOrEqual(2_000);
});
