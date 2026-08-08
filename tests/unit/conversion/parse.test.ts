import { describe, expect, it } from "vitest";

import { parseMarkdown } from "@/entities/conversion/parse";

describe("parseMarkdown", () => {
  it("parses representative GFM constructs with source positions", () => {
    const tree = parseMarkdown("~~gone~~\n\n| a | b |\n| - | - |\n| 1 | 2 |\n\n- [x] done");

    expect(tree.children.map((node) => node.type)).toEqual([
      "paragraph",
      "table",
      "list",
    ]);
    expect(tree.children[1]?.position?.start).toMatchObject({ line: 3, column: 1 });
  });

  it("turns raw HTML into inert positioned text", () => {
    const tree = parseMarkdown("before\n\n<script>alert(1)</script>");
    const raw = tree.children[1];

    expect(raw).toMatchObject({ type: "paragraph" });
    expect("children" in raw && raw.children[0]).toMatchObject({
      type: "text",
      value: "<script>alert(1)</script>",
      position: { start: { line: 3, column: 1 } },
    });
  });
});
