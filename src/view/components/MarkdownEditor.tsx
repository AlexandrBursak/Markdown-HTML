import { useEffect, useRef, useState } from "react";

interface MarkdownEditorProps {
  value: string;
  onChange(value: string, isComposing: boolean): void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [editorValue, setEditorValue] = useState(value);
  const isComposing = useRef(false);

  useEffect(() => {
    if (!isComposing.current) setEditorValue(value);
  }, [value]);

  return (
    <label>
      <span>Markdown</span>
      <textarea
        aria-label="Markdown"
        value={editorValue}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          const composing = (event.nativeEvent as InputEvent).isComposing;
          setEditorValue(nextValue);
          if (!composing) onChange(nextValue, false);
        }}
        onCompositionStart={() => {
          isComposing.current = true;
        }}
        onCompositionEnd={(event) => {
          isComposing.current = false;
          setEditorValue(event.currentTarget.value);
          onChange(event.currentTarget.value, false);
        }}
        rows={18}
        spellCheck
      />
    </label>
  );
}
