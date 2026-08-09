import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { gotoConverter } from "./helpers/converter";

test("boots and exposes a keyboard focus target", async ({ page }) => {
  await gotoConverter(page);

  await expect(
    page.getByRole("heading", { name: "Markdown to HTML" }),
  ).toBeVisible();

  const accessibilityScan = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScan.violations).toEqual([]);

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to converter" })).toBeFocused();
});
