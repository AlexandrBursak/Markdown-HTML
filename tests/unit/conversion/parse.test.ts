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

  it("parses the full supported CommonMark and GFM construct families", () => {
    const tree = parseMarkdown([
      "# Heading",
      "",
      "> quoted **strong** and *emphasized* text",
      "",
      "1. ordered",
      "2. list",
      "",
      "- [x] task",
      "",
      "~~deleted~~ and https://example.com and `inline code`",
      "",
      "| left | right |",
      "| :--- | ---: |",
      "| a | b |",
      "",
      "```ts",
      "const value = 1;",
      "```",
      "",
      "[link](https://example.com) ![image](https://example.com/image.png)",
      "",
      "---",
    ].join("\n"));

    expect(tree.children.map((node) => node.type)).toEqual([
      "heading",
      "blockquote",
      "list",
      "list",
      "paragraph",
      "table",
      "code",
      "paragraph",
      "thematicBreak",
    ]);
    expect(tree.children[5]?.position?.start).toMatchObject({ line: 12, column: 1 });
    expect(tree.children[6]).toMatchObject({ type: "code", lang: "ts" });
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
