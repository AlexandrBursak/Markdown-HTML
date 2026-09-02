import { Button } from "@/shared/ui/button";

interface ConverterActionsProps {
  canCopy: boolean;
  onCopy(): void;
  onClear(): void;
  message: string;
}

export function ConverterActions({ canCopy, onCopy, onClear, message }: ConverterActionsProps) {
  return (
    <div>
      <Button {...{ autoComplete: "off" }} type="button" disabled={!canCopy} onClick={onCopy}>Copy HTML</Button>
      <Button type="button" variant="outline" onClick={onClear}>Clear</Button>
      <span aria-live="polite">{message}</span>
    </div>
  );
}
