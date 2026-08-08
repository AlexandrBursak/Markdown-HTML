export type ClipboardResult =
  | { ok: true }
  | { ok: false; reason: "denied" | "failed" };

interface ClipboardWriter {
  write(items: ClipboardItem[]): Promise<void>;
}

class CompatibleClipboardItem {
  readonly types: string[];

  constructor(private readonly representations: Record<string, Blob>) {
    this.types = Object.keys(representations);
  }

  async getType(type: string): Promise<Blob> {
    const representation = this.representations[type];
    if (!representation) throw new DOMException("Missing representation", "NotFoundError");
    return representation;
  }
}

function makeClipboardItem(html: string): ClipboardItem {
  const representations = {
    "text/plain": new Blob([html], { type: "text/plain" }),
    "text/html": new Blob([html], { type: "text/html" }),
  };
  const ClipboardItemConstructor = globalThis.ClipboardItem;
  return (ClipboardItemConstructor
    ? new ClipboardItemConstructor(representations)
    : new CompatibleClipboardItem(representations)) as ClipboardItem;
}

export function createHtmlClipboard(
  writer?: ClipboardWriter,
) {
  const activeWriter = writer ?? (typeof navigator === "undefined"
    ? { write: async () => { throw new Error("Clipboard unavailable"); } }
    : navigator.clipboard);
  return {
    async copy(html: string): Promise<ClipboardResult> {
      try {
        await activeWriter.write([makeClipboardItem(html)]);
        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          reason:
            error instanceof DOMException && error.name === "NotAllowedError"
              ? "denied"
              : "failed",
        };
      }
    },
  };
}
