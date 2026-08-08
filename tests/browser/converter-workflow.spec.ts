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

test("renders supported CommonMark and GFM families in both output surfaces", async ({ page }) => {
  await page.goto("/");
  const markdown = [
    "# Heading",
    "",
    "> **quoted**",
    "",
    "- [x] task",
    "",
    "~~deleted~~ and https://example.com",
    "",
    "| left | right |",
    "| --- | --- |",
    "| a | b |",
    "",
    "```ts",
    "const value = 1;",
    "```",
  ].join("\n");

  await page.getByRole("textbox", { name: "Markdown" }).fill(markdown);
  const preview = page.getByRole("region", { name: "Preview" });
  await expect(preview.getByRole("heading", { name: "Heading" })).toBeVisible();
  await expect(preview.locator("blockquote strong")).toHaveText("quoted");
  await expect(preview.locator('input[type="checkbox"]')).toBeChecked();
  await expect(preview.locator("del")).toHaveText("deleted");
  await expect(preview.locator("table")).toContainText("right");
  await expect(preview.locator("pre code.language-ts")).toContainText("const value = 1;");

  const html = page.getByRole("textbox", { name: "Generated HTML" });
  await expect(html).toHaveValue(/<h1>Heading<\/h1>/);
  await expect(html).toHaveValue(/<blockquote>/);
  await expect(html).toHaveValue(/<table>/);
  await expect(html).toHaveValue(/<code class="language-ts">/);
});

test("keeps a retained draft isolated to its browser profile", async ({ browser, page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "Markdown" }).fill("profile one only");
  await page.waitForTimeout(550);

  const separateProfile = await browser.newContext();
  try {
    const separatePage = await separateProfile.newPage();
    const requests: string[] = [];
    separatePage.on("request", (request) => requests.push(request.url()));
    await separatePage.goto("http://127.0.0.1:4173/");

    await expect(separatePage.getByRole("textbox", { name: "Markdown" })).toHaveValue("");
    expect(requests.some((url) => /draft|document/i.test(new URL(url).pathname))).toBe(false);
  } finally {
    await separateProfile.close();
  }
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
