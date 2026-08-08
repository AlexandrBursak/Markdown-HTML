"use client";

import { useEffect, useState } from "react";

import { createDraftStorage } from "@/shared/browser/draftStorage";
import { HtmlOutputPanel } from "@/view/components/HtmlOutputPanel";
import { MarkdownEditor } from "@/view/components/MarkdownEditor";
import { OutputModeControl } from "@/view/components/OutputModeControl";
import { PreviewPanel } from "@/view/components/PreviewPanel";
import { SanitizationNotice } from "@/view/components/SanitizationNotice";
import { StatusNotice } from "@/view/components/StatusNotice";

import styles from "./ConverterWidget.module.css";
import { useConverterState } from "./useConverterState";

export function ConverterWidget() {
  const [drafts] = useState(() => createDraftStorage());
  const [restored] = useState(() => drafts.restore());
  const converter = useConverterState({ initialMarkdown: restored.markdown });
  const tabOnly = restored.persistence === "tab";

  useEffect(() => {
    drafts.scheduleSave(converter.markdown);
  }, [converter.markdown, drafts]);

  return (
    <section className={styles.workspace} aria-label="Markdown converter">
      <div className={styles.toolbar}>
        <OutputModeControl mode={converter.mode} onChange={converter.setMode} />
        <span aria-live="polite">{converter.canCopy ? "Output is current" : "Enter Markdown to convert"}</span>
      </div>
      <StatusNotice isOversize={converter.isOversize} tabOnly={tabOnly} />
      <SanitizationNotice diagnostics={converter.result.diagnostics} />
      <div className={styles.grid}>
        <MarkdownEditor value={converter.markdown} onChange={converter.updateMarkdown} />
        <PreviewPanel html={converter.result.fragmentHtml} />
        <HtmlOutputPanel html={converter.result.html} />
      </div>
    </section>
  );
}
