import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { gotoConverter } from "./helpers/converter";

test("has no critical or serious violations across the complete keyboard workflow", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        write: async () => {
          throw new DOMException("denied", "NotAllowedError");
        },
      },
    });
  });
  await gotoConverter(page);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to converter" })).toBeFocused();
  await page.keyboard.press("Enter");

  const editor = page.getByRole("textbox", { name: "Markdown" });
  await editor.focus();
  await page.keyboard.type("<script>unsafe()</script>");
  await page.getByText("1 transformation made").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Escaped raw HTML (1)")).toBeVisible();

  const fullDocument = page.getByRole("radio", { name: "Full document" });
  await fullDocument.focus();
  await page.keyboard.press("Space");
  await expect(fullDocument).toBeChecked();

  const copy = page.getByRole("button", { name: "Copy HTML" });
  await copy.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Copy failed/)).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Generated HTML" })).toBeFocused();

  const populatedScan = await new AxeBuilder({ page }).analyze();
  expect(populatedScan.violations.filter(({ impact }) => impact === "critical" || impact === "serious")).toEqual([]);

  const clear = page.getByRole("button", { name: "Clear" });
  await clear.focus();
  await page.keyboard.press("Enter");
  await expect(editor).toHaveValue("");

  const clearedScan = await new AxeBuilder({ page }).analyze();
  expect(clearedScan.violations.filter(({ impact }) => impact === "critical" || impact === "serious")).toEqual([]);
});
