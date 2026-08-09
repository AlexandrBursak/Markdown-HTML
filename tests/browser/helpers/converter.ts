import { expect, type Page } from "@playwright/test";

export async function waitForConverter(page: Page): Promise<void> {
  await expect(page.getByRole("region", { name: "Markdown converter" })).toHaveAttribute(
    "data-hydrated",
    "true",
  );
}

export async function gotoConverter(page: Page, url = "/"): Promise<void> {
  await page.goto(url);
  await waitForConverter(page);
}
