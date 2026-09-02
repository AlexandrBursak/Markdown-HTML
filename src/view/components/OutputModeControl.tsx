import type { OutputMode } from "@/entities/conversion/types";

import styles from "./OutputModeControl.module.css";

interface OutputModeControlProps {
  mode: OutputMode;
  onChange(mode: OutputMode): void;
}

export function OutputModeControl({ mode, onChange }: OutputModeControlProps) {
  return (
    <fieldset className={styles.control}>
      <legend className={styles.legend}>Output format</legend>
      <div className={styles.options}>
        <label className={styles.option}>
          <input type="radio" name="output-mode" checked={mode === "fragment"} onChange={() => onChange("fragment")} />
          HTML fragment
        </label>
        <label className={styles.option}>
          <input type="radio" name="output-mode" checked={mode === "document"} onChange={() => onChange("document")} />
          Full document
        </label>
      </div>
    </fieldset>
  );
}
