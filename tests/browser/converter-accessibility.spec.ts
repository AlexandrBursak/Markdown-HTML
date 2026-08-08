import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("has no critical or serious violations and supports keyboard entry", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to converter" })).toBeFocused();
  await page.getByRole("textbox", { name: "Markdown" }).fill("# Accessible");
  const scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations.filter(({ impact }) => impact === "critical" || impact === "serious")).toEqual([]);
});
