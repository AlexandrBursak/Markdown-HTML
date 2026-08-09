export function StatusNotice({ isOversize, tabOnly }: { isOversize: boolean; tabOnly: boolean }) {
  if (!isOversize && !tabOnly) return null;
  return (
    <div role="status" aria-live="polite">
      {isOversize && <p>This draft exceeds 100,000 Unicode code points. Editing continues, but conversion has no latency guarantee.</p>}
      {tabOnly && <p>This draft is retained only in the current tab because browser profile storage is unavailable.</p>}
    </div>
  );
}
