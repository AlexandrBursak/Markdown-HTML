import type { Content, Html, Root, RootContent, Text } from "mdast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

import type { ParsedMarkdown, TransformationDiagnostic } from "./types";

interface MutableParent {
  children: Content[];
}

function isParent(node: Content | Root): node is (Content | Root) & MutableParent {
  return "children" in node && Array.isArray(node.children);
}

function inertText(node: Html): Text {
  return { type: "text", value: node.value, position: node.position };
}

function replaceInlineHtml(parent: MutableParent): void {
  parent.children = parent.children.map((child) => {
    if (child.type === "html") return inertText(child);
    if (isParent(child)) replaceInlineHtml(child);
    return child;
  });
}

export function parseMarkdownWithDiagnostics(markdown: string): ParsedMarkdown {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
  const diagnostics: TransformationDiagnostic[] = [];

  tree.children = tree.children.map((child): RootContent => {
    if (child.type === "html") {
      if (child.position) {
        diagnostics.push({ category: "escaped-raw-html", position: child.position });
      }
      return {
        type: "paragraph",
        children: [inertText(child)],
        position: child.position,
      };
    }

    collectAndReplaceInlineHtml(child, diagnostics);
    return child;
  });

  return { tree, diagnostics };
}

function collectAndReplaceInlineHtml(
  node: RootContent,
  diagnostics: TransformationDiagnostic[],
): void {
  if (!isParent(node)) return;
  for (const child of node.children) {
    if (child.type === "html" && child.position) {
      diagnostics.push({ category: "escaped-raw-html", position: child.position });
    } else if (isParent(child)) {
      collectAndReplaceInlineHtml(child as RootContent, diagnostics);
    }
  }
  replaceInlineHtml(node);
}

export function parseMarkdown(markdown: string): Root {
  return parseMarkdownWithDiagnostics(markdown).tree;
}
