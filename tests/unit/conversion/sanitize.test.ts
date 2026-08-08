import { describe, expect, it } from "vitest";

import { convertMarkdown } from "@/entities/conversion/convert";

describe("conversion security policy", () => {
  it("escapes raw HTML and reports content-free positions", () => {
    const result = convertMarkdown('<img src=x onerror=alert(1)>', 1, "fragment");

    expect(result.html).not.toContain("<img");
    const document = new DOMParser().parseFromString(result.html, "text/html");
    expect(document.body.textContent).toBe("<img src=x onerror=alert(1)>");
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        category: "escaped-raw-html",
        position: expect.objectContaining({ start: { line: 1, column: 1, offset: 0 } }),
      }),
    ]);
    expect(JSON.stringify(result.diagnostics)).not.toContain("onerror");
  });

  it.each(["javascript:alert(1)", "data:text/html,bad", "vbscript:bad"])(
    "removes a disallowed URL scheme: %s",
    (url) => {
      const result = convertMarkdown(`[safe label](${url})`, 1, "fragment");
      expect(result.html).toBe("<p>safe label</p>");
      expect(result.diagnostics[0]?.category).toBe("removed-url");
    },
  );
});
