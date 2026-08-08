import { expect, test } from "@playwright/test";

function percentile95(samples: number[]): number {
  return [...samples].sort((a, b) => a - b)[Math.ceil(samples.length * 0.95) - 1] ?? Infinity;
}

test("converts documents through 100,000 code points within the p95 budget", async ({ page }) => {
  await page.goto("/");
  const editor = page.getByRole("textbox", { name: "Markdown" });
  const output = page.getByRole("textbox", { name: "Generated HTML" });
  const samples = await editor.evaluate((element) => {
    const textarea = element as HTMLTextAreaElement;
    const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
    if (!setValue) throw new Error("Native textarea setter unavailable");
    const timings: number[] = [];
    for (let index = 0; index < 10; index += 1) {
      const markdown = `${"a".repeat(99_990)}-${index}`;
      setValue.call(textarea, markdown);
      const started = performance.now();
      textarea.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: null }));
      timings.push(performance.now() - started);
    }
    return timings;
  });
  await expect(output).toHaveValue(`<p>${"a".repeat(99_990)}-9</p>`);
  expect(percentile95(samples)).toBeLessThanOrEqual(100);
});

test("makes the cold converter usable within two seconds", async ({ page }) => {
  const started = performance.now();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("textbox", { name: "Markdown" })).toBeEditable();
  await expect(page.getByRole("region", { name: "Preview" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Generated HTML" })).toBeVisible();
  expect(performance.now() - started).toBeLessThanOrEqual(2_000);
});
