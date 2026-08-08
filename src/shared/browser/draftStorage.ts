const PROFILE_KEY = "markdown-html:latest-draft";
const AUTOSAVE_DELAY_MS = 500;

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface DraftStorageOptions {
  profileStorage?: StorageLike;
}

export interface RestoredDraft {
  markdown: string;
  persistence: "profile" | "tab";
}

export type DraftPersistenceResult = Pick<RestoredDraft, "persistence">;

function browserProfileStorage(): StorageLike | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function createDraftStorage(options: DraftStorageOptions = {}) {
  let memoryDraft = "";
  const profileStorage = options.profileStorage ?? browserProfileStorage();
  let persistence: RestoredDraft["persistence"] = profileStorage ? "profile" : "tab";
  let saveTimer: ReturnType<typeof setTimeout> | undefined;

  function write(markdown: string): DraftPersistenceResult {
    memoryDraft = markdown;
    if (!profileStorage) {
      persistence = "tab";
      return { persistence };
    }
    try {
      if (markdown) profileStorage.setItem(PROFILE_KEY, markdown);
      else profileStorage.removeItem(PROFILE_KEY);
      persistence = "profile";
      return { persistence };
    } catch {
      persistence = "tab";
      return { persistence };
    }
  }

  return {
    scheduleSave(
      markdown: string,
      onSaved?: (result: DraftPersistenceResult) => void,
    ): void {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        const result = write(markdown);
        onSaved?.(result);
      }, AUTOSAVE_DELAY_MS);
    },
    restore(): RestoredDraft {
      if (profileStorage) {
        try {
          const markdown = profileStorage.getItem(PROFILE_KEY);
          if (markdown !== null) return { markdown, persistence: "profile" };
        } catch {
          persistence = "tab";
          return { markdown: memoryDraft, persistence: "tab" };
        }
      }
      return {
        markdown: memoryDraft,
        persistence,
      };
    },
    clear(): { ok: boolean } {
      if (saveTimer) clearTimeout(saveTimer);
      memoryDraft = "";
      if (!profileStorage) return { ok: true };
      try {
        profileStorage.removeItem(PROFILE_KEY);
        return { ok: true };
      } catch {
        return { ok: false };
      }
    },
  };
}
