import type { ConversionResult, OutputMode } from "@/entities/conversion/types";

export interface ConverterState {
  markdown: string;
  mode: OutputMode;
  result: ConversionResult;
  codePointCount: number;
  isOversize: boolean;
  canCopy: boolean;
  updateMarkdown(markdown: string, isComposing: boolean): void;
  setMode(mode: OutputMode): void;
  clear(): void;
}
