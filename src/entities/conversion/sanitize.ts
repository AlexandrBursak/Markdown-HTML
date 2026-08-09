import type { Content, Image, Link, Parent, Root } from "mdast";

import type { TransformationDiagnostic } from "./types";

function isParent(node: Content | Root): node is (Content | Root) & Parent {
  return "children" in node && Array.isArray(node.children);
}

function isAllowedUrl(url: string, image: boolean): boolean {
  const normalized = url.trim().toLowerCase();
  if (normalized.startsWith("/") || normalized.startsWith("./") || normalized.startsWith("../") || normalized.startsWith("#")) {
    return true;
  }
  if (normalized.startsWith("https://")) return true;
  if (!image && (normalized.startsWith("http://") || normalized.startsWith("mailto:"))) return true;
  return !/^[a-z][a-z\d+.-]*:/i.test(normalized);
}

export function sanitizeTree(
  tree: Root,
  initialDiagnostics: TransformationDiagnostic[],
): TransformationDiagnostic[] {
  const diagnostics = [...initialDiagnostics];
  sanitizeChildren(tree, diagnostics);
  return diagnostics;
}

function sanitizeChildren(
  parent: Parent,
  diagnostics: TransformationDiagnostic[],
): void {
  parent.children = parent.children.flatMap((child) => {
    if (child.type === "link" && !isAllowedUrl(child.url, false)) {
      reportRemovedUrl(child, diagnostics);
      sanitizeChildren(child, diagnostics);
      return child.children;
    }
    if (child.type === "image" && !isAllowedUrl(child.url, true)) {
      reportRemovedUrl(child, diagnostics);
      return child.alt ? [{ type: "text", value: child.alt, position: child.position }] : [];
    }
    if (isParent(child)) sanitizeChildren(child, diagnostics);
    return child;
  });
}

function reportRemovedUrl(
  node: Link | Image,
  diagnostics: TransformationDiagnostic[],
): void {
  if (node.position) diagnostics.push({ category: "removed-url", position: node.position });
}
