import type { Root } from "mdast";

export type OutputMode = "fragment" | "document";

export interface SourcePoint {
  line: number;
  column: number;
  offset?: number;
}

export interface SourceRange {
  start: SourcePoint;
  end: SourcePoint;
}

export type TransformationCategory =
  | "escaped-raw-html"
  | "removed-url"
  | "changed-structure";

export interface TransformationDiagnostic {
  category: TransformationCategory;
  position: SourceRange;
}

export interface ParsedMarkdown {
  tree: Root;
  diagnostics: TransformationDiagnostic[];
}

export interface ConversionResult {
  revision: number;
  mode: OutputMode;
  html: string;
  fragmentHtml: string;
  diagnostics: TransformationDiagnostic[];
}
