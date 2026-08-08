import { describe, expect, it } from "vitest";

import { convertMarkdown } from "@/entities/conversion/convert";

describe("deterministic conversion", () => {
  it("serializes GFM and uses the same fragment for preview and source", () => {
    const result = convertMarkdown("~~gone~~\n\n- [x] done", 4, "fragment");
    expect(result.fragmentHtml).toContain("<del>gone</del>");
    expect(result.fragmentHtml).toContain('type="checkbox"');
    expect(result.html).toBe(result.fragmentHtml);
  });

  it("wraps the exact fragment in the strict minimal document", () => {
    const result = convertMarkdown("**Hello**", 2, "document");
    expect(result.html).toBe(
      '<!doctype html><html><head><meta charset="utf-8"></head><body><p><strong>Hello</strong></p></body></html>',
    );
  });
});
