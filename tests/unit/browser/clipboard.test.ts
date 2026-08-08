import { describe, expect, it, vi } from "vitest";

import { createHtmlClipboard } from "@/shared/browser/clipboard";

describe("HTML clipboard", () => {
  it("writes identical current HTML in plain and rich representations", async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    const clipboard = createHtmlClipboard({ write });
    const html = "<p>Current</p>";

    await expect(clipboard.copy(html)).resolves.toEqual({ ok: true });
    const item = write.mock.calls[0]?.[0][0] as ClipboardItem;
    await expect((await item.getType("text/plain")).text()).resolves.toBe(html);
    await expect((await item.getType("text/html")).text()).resolves.toBe(html);
  });

  it("returns typed denial and failure results", async () => {
    const denied = createHtmlClipboard({ write: vi.fn().mockRejectedValue(new DOMException("No", "NotAllowedError")) });
    const failed = createHtmlClipboard({ write: vi.fn().mockRejectedValue(new Error("broken")) });
    await expect(denied.copy("x")).resolves.toEqual({ ok: false, reason: "denied" });
    await expect(failed.copy("x")).resolves.toEqual({ ok: false, reason: "failed" });
  });
});
