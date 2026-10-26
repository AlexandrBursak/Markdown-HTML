"use client";

import { useRef, useState } from "react";

import styles from "./PreviewPanel.module.css";

interface PreviewPanelProps {
  html: string;
}

const PRESETS = [
  { label: "Mobile", width: "375px" },
  { label: "Tablet", width: "768px" },
  { label: "Full", width: "" },
] as const;

type PresetLabel = (typeof PRESETS)[number]["label"];

export function PreviewPanel({ html }: PreviewPanelProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<PresetLabel | null>("Full");

  function applyPreset(label: PresetLabel, width: string): void {
    // Set the style directly: dragging the resize handle also writes it there.
    if (frameRef.current) frameRef.current.style.width = width;
    setActive(label);
  }

  return (
    <section aria-label="Preview" className={styles.panel}>
      <div className={styles.header}>
        <h2>Preview</h2>
        <div className={styles.presets} role="group" aria-label="Preview width">
          {PRESETS.map(({ label, width }) => (
            <button
              key={label}
              type="button"
              className={styles.preset}
              aria-pressed={active === label}
              onClick={() => applyPreset(label, width)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={frameRef}
        className={styles.frame}
        data-testid="preview-frame"
        title="Drag the corner to change the width"
        onPointerUp={(event) => {
          const width = event.currentTarget.style.width;
          setActive(PRESETS.find((preset) => preset.width === width)?.label ?? null);
        }}
      >
        <div className={styles.content} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </section>
  );
}
