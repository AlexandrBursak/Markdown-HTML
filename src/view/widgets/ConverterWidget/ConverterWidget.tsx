"use client";

import { HtmlOutputPanel } from "@/view/components/HtmlOutputPanel";
import { MarkdownEditor } from "@/view/components/MarkdownEditor";
import { OutputModeControl } from "@/view/components/OutputModeControl";
import { PreviewPanel } from "@/view/components/PreviewPanel";

import styles from "./ConverterWidget.module.css";
import { useConverterState } from "./useConverterState";

export function ConverterWidget() {
  const converter = useConverterState();

  return (
    <section className={styles.workspace} aria-label="Markdown converter">
      <div className={styles.toolbar}>
        <OutputModeControl mode={converter.mode} onChange={converter.setMode} />
        <span aria-live="polite">{converter.canCopy ? "Output is current" : "Enter Markdown to convert"}</span>
      </div>
      <div className={styles.grid}>
        <MarkdownEditor value={converter.markdown} onChange={converter.updateMarkdown} />
        <PreviewPanel html={converter.result.fragmentHtml} />
        <HtmlOutputPanel html={converter.result.html} />
      </div>
    </section>
  );
}
