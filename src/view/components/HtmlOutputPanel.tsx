import { forwardRef } from "react";

interface HtmlOutputPanelProps {
  html: string;
}

export const HtmlOutputPanel = forwardRef<HTMLTextAreaElement, HtmlOutputPanelProps>(
  function HtmlOutputPanel({ html }, ref) {
    return (
      <label>
        <span>Generated HTML</span>
        <textarea
          ref={ref}
          aria-label="Generated HTML"
          value={html}
          readOnly
          rows={18}
          spellCheck={false}
        />
      </label>
    );
  },
);
