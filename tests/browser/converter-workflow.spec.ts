import { expect, test } from "@playwright/test";

test("converts GFM, switches modes, restores, and clears", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.goto("/");
  const editor = page.getByRole("textbox", { name: "Markdown" });
  await editor.fill("~~done~~\n\n- [x] task");
  await expect(page.getByRole("region", { name: "Preview" })).toContainText("done");
  await expect(page.getByRole("textbox", { name: "Generated HTML" })).toHaveValue(/<del>done<\/del>/);
  await page.getByRole("radio", { name: "Full document" }).check();
  await expect(page.getByRole("textbox", { name: "Generated HTML" })).toHaveValue(/^<!doctype html>/);
  await page.waitForTimeout(550);
  await page.reload();
  await expect(editor).toHaveValue("~~done~~\n\n- [x] task");
  await page.getByRole("button", { name: "Clear" }).click();
  await expect(editor).toHaveValue("");
  await page.reload();
  await expect(editor).toHaveValue("");
  expect(consoleErrors.filter((message) => message.includes("hydrated"))).toEqual([]);
});

test("reports raw HTML without executing it", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "Markdown" }).fill("<script>window.__unsafe = true</script>");
  await expect(page.getByText("1 transformation made")).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { __unsafe?: boolean }).__unsafe)).toBeUndefined();
});

for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1280, height: 800 }]) {
  test(`keeps all panels usable at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.getByRole("textbox", { name: "Markdown" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Preview" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Generated HTML" })).toBeVisible();
  });
}
