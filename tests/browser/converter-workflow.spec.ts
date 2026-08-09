import { expect, test } from "@playwright/test";

import { officialGfmConstructFixtures } from "./fixtures/gfm";
import { gotoConverter, waitForConverter } from "./helpers/converter";

test("converts GFM, switches modes, restores, and clears", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await gotoConverter(page);
  const editor = page.getByRole("textbox", { name: "Markdown" });
  await editor.fill("~~done~~\n\n- [x] task");
  await expect(page.getByRole("region", { name: "Preview" })).toContainText("done");
  await expect(page.getByRole("textbox", { name: "Generated HTML" })).toHaveValue(/<del>done<\/del>/);
  await page.getByRole("radio", { name: "Full document" }).check();
  await expect(page.getByRole("textbox", { name: "Generated HTML" })).toHaveValue(/^<!doctype html>/);
  await page.waitForTimeout(550);
  await page.reload();
  await waitForConverter(page);
  await expect(editor).toHaveValue("~~done~~\n\n- [x] task");
  await page.getByRole("button", { name: "Clear" }).click();
  await expect(editor).toHaveValue("");
  await page.reload();
  await waitForConverter(page);
  await expect(editor).toHaveValue("");
  expect(consoleErrors.filter((message) => message.includes("hydrated"))).toEqual([]);
});

test("reports raw HTML without executing it", async ({ page }) => {
  await gotoConverter(page);
  await page.getByRole("textbox", { name: "Markdown" }).fill("<script>window.__unsafe = true</script>");
  await expect(page.getByText("1 transformation made")).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { __unsafe?: boolean }).__unsafe)).toBeUndefined();
});

test("publishes composed input only when character composition completes", async ({ page }) => {
  await gotoConverter(page);
  const editor = page.getByRole("textbox", { name: "Markdown" });
  const html = page.getByRole("textbox", { name: "Generated HTML" });

  await editor.fill("before");
  await expect(html).toHaveValue("<p>before</p>");

  await editor.evaluate((element) => {
    const textarea = element as HTMLTextAreaElement;
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value",
    )?.set;
    if (!setValue) throw new Error("Native textarea setter unavailable");

    textarea.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    setValue.call(textarea, "完成");
    textarea.dispatchEvent(new InputEvent("input", {
      bubbles: true,
      data: "成",
      inputType: "insertCompositionText",
      isComposing: true,
    }));
  });

  await expect(html).toHaveValue("<p>before</p>");
  await editor.dispatchEvent("compositionend", { data: "完成" });
  await expect(editor).toHaveValue("完成");
  await expect(page.getByRole("region", { name: "Preview" }).locator("p")).toHaveText("完成");
  await expect(html).toHaveValue("<p>完成</p>");
});

test("selects the complete visible HTML when clipboard access is denied", async ({ page }) => {
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
  await page.getByRole("textbox", { name: "Markdown" }).fill("Copy me");
  await page.getByRole("button", { name: "Copy HTML" }).click();

  await expect(page.getByText("Copy failed. The HTML is selected for manual copying.")).toBeVisible();
  const output = page.getByRole("textbox", { name: "Generated HTML" });
  await expect(output).toBeFocused();
  expect(await output.evaluate((element) => {
    const textarea = element as HTMLTextAreaElement;
    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
      length: textarea.value.length,
    };
  })).toEqual({ start: 0, end: 14, length: 14 });
});

test("selects the visible HTML when the browser has no clipboard capability", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
  });
  await gotoConverter(page);
  await page.getByRole("textbox", { name: "Markdown" }).fill("Unavailable clipboard");
  await page.getByRole("button", { name: "Copy HTML" }).click();

  await expect(page.getByText("Copy failed. The HTML is selected for manual copying.")).toBeVisible();
  const output = page.getByRole("textbox", { name: "Generated HTML" });
  await expect(output).toBeFocused();
  expect(await output.evaluate((element) => {
    const textarea = element as HTMLTextAreaElement;
    return {
      selected: textarea.value.slice(textarea.selectionStart, textarea.selectionEnd),
      value: textarea.value,
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    };
  })).toEqual({
    selected: "<p>Unavailable clipboard</p>",
    value: "<p>Unavailable clipboard</p>",
    start: 0,
    end: 28,
  });
});

for (const failure of ["access", "write"] as const) {
  test(`retains the current tab and warns when profile storage ${failure} fails`, async ({ page }) => {
    await page.addInitScript((failureMode) => {
      if (failureMode === "access") {
        Object.defineProperty(window, "localStorage", {
          configurable: true,
          get: () => { throw new DOMException("denied", "SecurityError"); },
        });
        return;
      }
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function setItem(key, value) {
        if (this === window.localStorage) throw new DOMException("quota", "QuotaExceededError");
        return originalSetItem.call(this, key, value);
      };
    }, failure);
    await gotoConverter(page);
    const editor = page.getByRole("textbox", { name: "Markdown" });
    await editor.fill(`${failure} failure draft`);

    await expect(page.getByText(/retained only in the current tab/i)).toBeVisible();
    await expect(editor).toHaveValue(`${failure} failure draft`);
    expect(await page.evaluate(() => {
      try {
        return window.localStorage.getItem("markdown-html:latest-draft");
      } catch {
        return null;
      }
    })).toBeNull();
    await page.getByRole("radio", { name: "Full document" }).check();
    await expect(editor).toHaveValue(`${failure} failure draft`);
    await expect(page.getByText(/retained only in the current tab/i)).toBeVisible();
  });
}

test("renders supported CommonMark and GFM families in both output surfaces", async ({ page }) => {
  await gotoConverter(page);
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

test("matches every official GFM construct family in preview and generated HTML", async ({ page }) => {
  await gotoConverter(page);
  const editor = page.getByRole("textbox", { name: "Markdown" });
  const html = page.getByRole("textbox", { name: "Generated HTML" });
  const previewBody = page.getByRole("region", { name: "Preview" }).locator(":scope > div");

  for (const fixture of officialGfmConstructFixtures) {
    await test.step(fixture.section, async () => {
      await editor.fill(fixture.markdown);
      await expect(html).toHaveValue(fixture.html);
      const normalizedExpected = await page.evaluate((expected) => {
        const template = document.createElement("template");
        template.innerHTML = expected;
        return template.innerHTML;
      }, fixture.html);
      await expect.poll(() => previewBody.evaluate((element) => element.innerHTML)).toBe(normalizedExpected);
    });
  }
});

test("keeps a retained draft isolated to its browser profile", async ({ browser, page }) => {
  await gotoConverter(page);
  await page.getByRole("textbox", { name: "Markdown" }).fill("profile one only");
  await page.waitForTimeout(550);

  const separateProfile = await browser.newContext();
  try {
    const separatePage = await separateProfile.newPage();
    const requests: string[] = [];
    separatePage.on("request", (request) => requests.push(request.url()));
    await gotoConverter(separatePage, "http://127.0.0.1:4173/");

    await expect(separatePage.getByRole("textbox", { name: "Markdown" })).toHaveValue("");
    expect(requests.some((url) => /draft|document/i.test(new URL(url).pathname))).toBe(false);
  } finally {
    await separateProfile.close();
  }
});

for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1280, height: 800 }]) {
  test(`keeps all panels usable at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await gotoConverter(page);
    await expect(page.getByRole("textbox", { name: "Markdown" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Preview" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Generated HTML" })).toBeVisible();
  });
}
