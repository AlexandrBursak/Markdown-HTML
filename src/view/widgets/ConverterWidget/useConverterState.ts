"use client";

import { useMemo, useState } from "react";

import { convertMarkdown } from "@/entities/conversion/convert";
import type { OutputMode } from "@/entities/conversion/types";

import type { ConverterState } from "./types";

const SUPPORTED_CODE_POINTS = 100_000;

export function useConverterState(
  options: { initialMarkdown?: string } = {},
): ConverterState {
  const [markdown, setMarkdown] = useState(options.initialMarkdown ?? "");
  const [mode, updateMode] = useState<OutputMode>("fragment");
  const [revision, setRevision] = useState(0);

  const result = useMemo(
    () => convertMarkdown(markdown, revision, mode),
    [markdown, revision, mode],
  );
  const codePointCount = Array.from(markdown).length;
  const isOversize = codePointCount > SUPPORTED_CODE_POINTS;
  const isFresh = result.revision === revision && result.mode === mode;

  return {
    markdown,
    mode,
    result,
    codePointCount,
    isOversize,
    canCopy: markdown.length > 0 && isFresh,
    updateMarkdown(nextMarkdown, isComposing) {
      if (isComposing) return;
      setMarkdown(nextMarkdown);
      setRevision((current) => current + 1);
    },
    setMode(nextMode) {
      updateMode(nextMode);
    },
    clear() {
      setMarkdown("");
      setRevision((current) => current + 1);
    },
  };
}
