"use client";

import { useEffect, useRef, useState } from "react";

import { createHtmlClipboard } from "@/shared/browser/clipboard";
import { createDraftStorage } from "@/shared/browser/draftStorage";
import { ConverterActions } from "@/view/components/ConverterActions";
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
  const [clipboard] = useState(() => createHtmlClipboard());
  const [actionMessage, setActionMessage] = useState("");
  const [tabOnly, setTabOnly] = useState(false);
  const outputRef = useRef<HTMLTextAreaElement>(null);
  const converter = useConverterState();

  useEffect(() => {
    queueMicrotask(() => {
      const restored = drafts.restore();
      if (restored.markdown) converter.updateMarkdown(restored.markdown, false);
      setTabOnly(restored.persistence === "tab");
    });
  // Restoration must happen after the server-compatible first client render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drafts]);

  useEffect(() => {
    drafts.scheduleSave(converter.markdown, ({ persistence }) => {
      setTabOnly(persistence === "tab");
    });
  }, [converter.markdown, drafts]);

  async function copyHtml(): Promise<void> {
    const outcome = await clipboard.copy(converter.result.html);
    if (outcome.ok) {
      setActionMessage("HTML copied");
      return;
    }
    setActionMessage("Copy failed. The HTML is selected for manual copying.");
    outputRef.current?.focus();
    outputRef.current?.select();
  }

  function clearDraft(): void {
    const outcome = drafts.clear();
    converter.clear();
    setActionMessage(outcome.ok ? "Draft cleared" : "Draft cleared here, but browser storage removal failed");
  }

  return (
    <section className={styles.workspace} aria-label="Markdown converter">
      <div className={styles.toolbar}>
        <OutputModeControl mode={converter.mode} onChange={converter.setMode} />
        <ConverterActions canCopy={converter.canCopy} onCopy={copyHtml} onClear={clearDraft} message={actionMessage} />
      </div>
      <StatusNotice isOversize={converter.isOversize} tabOnly={tabOnly} />
      <SanitizationNotice diagnostics={converter.result.diagnostics} />
      <div className={styles.grid}>
        <MarkdownEditor value={converter.markdown} onChange={converter.updateMarkdown} />
        <PreviewPanel html={converter.result.fragmentHtml} />
        <HtmlOutputPanel ref={outputRef} html={converter.result.html} />
      </div>
    </section>
  );
}
