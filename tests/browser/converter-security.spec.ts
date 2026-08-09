import { expect, test } from "@playwright/test";

import { unsafeMarkdownFixtures } from "./fixtures/security";
import { gotoConverter } from "./helpers/converter";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        write: async (items: ClipboardItem[]) => {
          const item = items[0];
          (window as Window & { __clipboard?: Record<string, string> }).__clipboard = {
            "text/plain": await (await item.getType("text/plain")).text(),
            "text/html": await (await item.getType("text/html")).text(),
          };
        },
      },
    });
  });
});

for (const [index, fixture] of unsafeMarkdownFixtures.entries()) {
  test(`blocks unsafe fixture ${index + 1}`, async ({ page }) => {
    await gotoConverter(page);
    await page.getByRole("textbox", { name: "Markdown" }).fill(fixture);
    expect(await page.evaluate(() => (window as Window & { __executed?: boolean }).__executed)).toBeUndefined();
    await expect(page.getByRole("region", { name: "Preview" }).locator("script, iframe, img")).toHaveCount(0);

    const visibleHtml = await page.getByRole("textbox", { name: "Generated HTML" }).inputValue();
    await page.getByRole("button", { name: "Copy HTML" }).click();
    const copiedHtml = await page.evaluate(
      () => (window as Window & { __clipboard?: Record<string, string> }).__clipboard?.["text/html"],
    );
    expect(copiedHtml).toBe(visibleHtml);
    expect(await page.evaluate(async (html) => {
      const frame = document.createElement("iframe");
      frame.srcdoc = html ?? "";
      document.body.append(frame);
      await new Promise((resolve) => frame.addEventListener("load", resolve, { once: true }));
      const frameWindow = frame.contentWindow as (Window & { __executed?: boolean }) | null;
      const unsafe = frame.contentDocument?.querySelector("script, iframe, img") !== null;
      const executed = frameWindow?.__executed === true;
      frame.remove();
      return { executed, unsafe };
    }, copiedHtml)).toEqual({ executed: false, unsafe: false });
  });
}

test("copies exactly the current visible sanitized HTML in both MIME types", async ({ page }) => {
  await gotoConverter(page);
  await page.getByRole("textbox", { name: "Markdown" }).fill("**safe**");
  const visibleHtml = await page.getByRole("textbox", { name: "Generated HTML" }).inputValue();
  await page.getByRole("button", { name: "Copy HTML" }).click();
  await expect(page.getByText("HTML copied")).toBeVisible();
  const copied = await page.evaluate(() => (window as Window & { __clipboard?: Record<string, string> }).__clipboard);
  expect(copied).toEqual({ "text/plain": visibleHtml, "text/html": visibleHtml });
});
