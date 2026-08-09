import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createDraftStorage } from "@/shared/browser/draftStorage";

describe("draft storage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => vi.useRealTimers());

  it("replaces and restores the latest profile draft within 500ms", () => {
    const drafts = createDraftStorage();
    drafts.scheduleSave("first");
    drafts.scheduleSave("latest");
    vi.advanceTimersByTime(500);
    expect(drafts.restore()).toEqual({ markdown: "latest", persistence: "profile" });
  });

  it("falls back to current-tab memory when profile storage fails", () => {
    const profileStorage = { getItem: () => null, setItem: () => { throw new Error("denied"); }, removeItem: () => { throw new Error("denied"); } };
    const drafts = createDraftStorage({ profileStorage });
    const persistence: string[] = [];
    drafts.scheduleSave("tab only", (result) => persistence.push(result.persistence));
    vi.advanceTimersByTime(500);
    expect(drafts.restore()).toEqual({ markdown: "tab only", persistence: "tab" });
    expect(persistence).toEqual(["tab"]);
  });

  it("restores the latest tab-memory draft after replacing an older profile draft fails", () => {
    const profileStorage = {
      getItem: () => "older profile draft",
      setItem: () => { throw new Error("denied"); },
      removeItem: () => { throw new Error("denied"); },
    };
    const drafts = createDraftStorage({ profileStorage });

    drafts.scheduleSave("latest tab draft");
    vi.advanceTimersByTime(500);

    expect(drafts.restore()).toEqual({
      markdown: "latest tab draft",
      persistence: "tab",
    });
  });

  it("guards browser storage capability access and retains only runtime memory", () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, "localStorage");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get: () => { throw new DOMException("denied", "SecurityError"); },
    });

    try {
      const drafts = createDraftStorage();
      drafts.scheduleSave("memory only");
      vi.advanceTimersByTime(500);
      expect(drafts.restore()).toEqual({ markdown: "memory only", persistence: "tab" });
      expect(sessionStorage.length).toBe(0);
    } finally {
      if (descriptor) Object.defineProperty(window, "localStorage", descriptor);
    }
  });

  it("clears profile and tab copies", () => {
    const drafts = createDraftStorage();
    drafts.scheduleSave("secret");
    vi.advanceTimersByTime(500);
    expect(drafts.clear()).toEqual({ ok: true });
    expect(drafts.restore()).toEqual({ markdown: "", persistence: "profile" });
  });

  it("does not recreate a retained record when empty input is scheduled after clear", () => {
    const drafts = createDraftStorage();
    drafts.scheduleSave("secret");
    vi.advanceTimersByTime(500);
    drafts.clear();
    drafts.scheduleSave("");
    vi.advanceTimersByTime(500);

    expect(localStorage.getItem("markdown-html:latest-draft")).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });
});
