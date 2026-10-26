import { expect, test } from "@playwright/test";

import { gotoConverter } from "./helpers/converter";

test("shows Markdown and HTML side by side with a full-width preview below", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoConverter(page);

  const markdown = (await page.getByRole("textbox", { name: "Markdown" }).boundingBox())!;
  const html = (await page.getByRole("textbox", { name: "Generated HTML" }).boundingBox())!;
  const preview = (await page.getByRole("region", { name: "Preview" }).boundingBox())!;
  const workspace = (await page.getByRole("region", { name: "Markdown converter" }).boundingBox())!;

  expect(Math.abs(markdown.y - html.y)).toBeLessThan(2);
  expect(html.x).toBeGreaterThan(markdown.x + markdown.width);
  expect(preview.y).toBeGreaterThan(markdown.y + markdown.height);
  expect(preview.width).toBeGreaterThan(workspace.width * 0.9);
});

test("narrows the preview with presets and by dragging its corner", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoConverter(page);
  const frame = page.getByTestId("preview-frame");

  await page.getByRole("button", { name: "Mobile" }).click();
  expect((await frame.boundingBox())!.width).toBeCloseTo(375, 0);

  await page.getByRole("button", { name: "Full" }).click();
  await frame.scrollIntoViewIfNeeded();
  const box = (await frame.boundingBox())!;
  await page.mouse.move(box.x + box.width - 3, box.y + box.height - 3);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 403, box.y + box.height - 3, { steps: 5 });
  await page.mouse.up();

  expect((await frame.boundingBox())!.width).toBeLessThan(box.width - 300);
  await expect(page.getByRole("button", { name: "Full" })).toHaveAttribute("aria-pressed", "false");
});

test("switches between light and dark and remembers the choice", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await gotoConverter(page);
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "dark");

  await page.getByRole("radio", { name: "Light" }).check();
  await expect(html).toHaveAttribute("data-theme", "light");
  const lightBackground = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("radio", { name: "Light" })).toBeChecked();

  await page.getByRole("radio", { name: "Dark" }).check();
  const darkBackground = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(darkBackground).not.toBe(lightBackground);
});
