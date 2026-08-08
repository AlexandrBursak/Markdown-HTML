const PROFILE_KEY = "markdown-html:latest-draft";
const TAB_KEY = "markdown-html:tab-draft";
const AUTOSAVE_DELAY_MS = 500;

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface DraftStorageOptions {
  profileStorage?: StorageLike;
  tabStorage?: StorageLike;
}

export interface RestoredDraft {
  markdown: string;
  persistence: "profile" | "tab";
}

export function createDraftStorage(options: DraftStorageOptions = {}) {
  let memoryDraft = "";
  const memoryStorage: StorageLike = {
    getItem: () => memoryDraft || null,
    setItem: (_key, value) => { memoryDraft = value; },
    removeItem: () => { memoryDraft = ""; },
  };
  const profileStorage = options.profileStorage ?? (typeof window === "undefined" ? memoryStorage : window.localStorage);
  const tabStorage = options.tabStorage ?? (typeof window === "undefined" ? memoryStorage : window.sessionStorage);
  let saveTimer: ReturnType<typeof setTimeout> | undefined;

  function write(markdown: string): void {
    memoryDraft = markdown;
    try {
      tabStorage.setItem(TAB_KEY, markdown);
    } catch {
      // The in-module value remains the last-resort current-tab copy.
    }
    try {
      profileStorage.setItem(PROFILE_KEY, markdown);
    } catch {
      // Profile persistence is best-effort and surfaced through restore state.
    }
  }

  return {
    scheduleSave(markdown: string): void {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => write(markdown), AUTOSAVE_DELAY_MS);
    },
    restore(): RestoredDraft {
      try {
        const markdown = profileStorage.getItem(PROFILE_KEY);
        if (markdown !== null) return { markdown, persistence: "profile" };
      } catch {
        // Fall through to the tab copy.
      }
      try {
        const markdown = tabStorage.getItem(TAB_KEY);
        if (markdown !== null) return { markdown, persistence: "tab" };
      } catch {
        // Fall through to in-module memory.
      }
      return { markdown: memoryDraft, persistence: memoryDraft ? "tab" : "profile" };
    },
    clear(): { ok: boolean } {
      if (saveTimer) clearTimeout(saveTimer);
      memoryDraft = "";
      let ok = true;
      for (const [storage, key] of [[profileStorage, PROFILE_KEY], [tabStorage, TAB_KEY]] as const) {
        try {
          storage.removeItem(key);
        } catch {
          ok = false;
        }
      }
      return { ok };
    },
  };
}
