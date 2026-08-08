interface ConverterActionsProps {
  canCopy: boolean;
  onCopy(): void;
  onClear(): void;
  message: string;
}

export function ConverterActions({ canCopy, onCopy, onClear, message }: ConverterActionsProps) {
  return (
    <div>
      <button type="button" disabled={!canCopy} onClick={onCopy}>Copy HTML</button>
      <button type="button" onClick={onClear}>Clear</button>
      <span aria-live="polite">{message}</span>
    </div>
  );
}
