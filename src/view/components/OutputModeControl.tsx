import type { OutputMode } from "@/entities/conversion/types";

interface OutputModeControlProps {
  mode: OutputMode;
  onChange(mode: OutputMode): void;
}

export function OutputModeControl({ mode, onChange }: OutputModeControlProps) {
  return (
    <fieldset>
      <legend>Output format</legend>
      <label>
        <input type="radio" name="output-mode" checked={mode === "fragment"} onChange={() => onChange("fragment")} />
        HTML fragment
      </label>
      <label>
        <input type="radio" name="output-mode" checked={mode === "document"} onChange={() => onChange("document")} />
        Full document
      </label>
    </fieldset>
  );
}
