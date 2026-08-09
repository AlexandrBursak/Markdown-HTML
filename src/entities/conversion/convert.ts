import { parseMarkdownWithDiagnostics } from "./parse";
import { sanitizeTree } from "./sanitize";
import { serializeFragment, serializeOutput } from "./serialize";
import type { ConversionResult, OutputMode } from "./types";

export function convertMarkdown(
  markdown: string,
  revision: number,
  mode: OutputMode,
): ConversionResult {
  const parsed = parseMarkdownWithDiagnostics(markdown);
  const diagnostics = sanitizeTree(parsed.tree, parsed.diagnostics);
  const fragmentHtml = serializeFragment(parsed.tree);

  return {
    revision,
    mode,
    fragmentHtml,
    html: serializeOutput(fragmentHtml, mode),
    diagnostics,
  };
}
