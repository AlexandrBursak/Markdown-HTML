interface MarkdownEditorProps {
  value: string;
  onChange(value: string, isComposing: boolean): void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  return (
    <label>
      <span>Markdown</span>
      <textarea
        aria-label="Markdown"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value, (event.nativeEvent as InputEvent).isComposing)}
        onCompositionEnd={(event) => onChange(event.currentTarget.value, false)}
        rows={18}
        spellCheck
      />
    </label>
  );
}
