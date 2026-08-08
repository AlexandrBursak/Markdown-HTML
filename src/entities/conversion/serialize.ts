import type { Root } from "mdast";
import { toHtml } from "hast-util-to-html";
import { toHast } from "mdast-util-to-hast";

import type { OutputMode } from "./types";

export function serializeFragment(tree: Root): string {
  return toHtml(toHast(tree), { allowDangerousHtml: false });
}

export function serializeOutput(fragment: string, mode: OutputMode): string {
  if (mode === "fragment") return fragment;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Markdown Preview</title></head><body>${fragment}</body></html>`;
}
