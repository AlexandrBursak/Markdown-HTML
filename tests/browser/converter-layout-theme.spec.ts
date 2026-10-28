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

test("aligns header and content in one column of at most 1200px", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await gotoConverter(page);

  const nav = (await page.getByRole("navigation", { name: "RexSoft services" }).boundingBox())!;
  const theme = (await page.getByRole("group", { name: "Theme" }).boundingBox())!;
  const workspace = (await page.getByRole("region", { name: "Markdown converter" }).boundingBox())!;

  expect(workspace.width).toBeLessThanOrEqual(1200);
  expect(workspace.width).toBeGreaterThan(1100);
  expect(Math.abs(nav.x - workspace.x)).toBeLessThan(2);
  expect(Math.abs(theme.x + theme.width - (workspace.x + workspace.width))).toBeLessThan(2);
});

test("keeps the footer at the bottom of the page", async ({ page }) => {
  await gotoConverter(page);
  const footer = page.getByRole("contentinfo");
  await expect(footer).toContainText("RexSoft");

  const bottom = await footer.evaluate((el) => el.getBoundingClientRect().bottom + window.scrollY);
  const pageHeight = await page.evaluate(() => Math.max(window.innerHeight, document.documentElement.scrollHeight));
  expect(Math.abs(bottom - pageHeight)).toBeLessThan(2);
});

test("narrows the preview with width presets", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoConverter(page);
  const frame = page.getByTestId("preview-frame");
  const fullWidth = (await frame.boundingBox())!.width;

  await page.getByRole("button", { name: "Mobile" }).click();
  expect((await frame.boundingBox())!.width).toBeCloseTo(375, 0);

  await page.getByRole("button", { name: "Tablet" }).click();
  expect((await frame.boundingBox())!.width).toBeCloseTo(768, 0);

  await page.getByRole("button", { name: "Full" }).click();
  expect((await frame.boundingBox())!.width).toBeCloseTo(fullWidth, 0);
});

test("narrows the preview by dragging its corner", async ({ page, browserName }) => {
  // Linux WebKit in CI ignores synthetic drags on the native resizer (macOS WebKit
  // passes), and iOS Safari has no CSS resize at all; presets cover both.
  test.skip(browserName === "webkit", "native resize handle is not drivable in WebKit automation");
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoConverter(page);
  const frame = page.getByTestId("preview-frame");

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
