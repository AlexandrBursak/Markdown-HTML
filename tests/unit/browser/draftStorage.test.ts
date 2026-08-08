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
    drafts.scheduleSave("tab only");
    vi.advanceTimersByTime(500);
    expect(drafts.restore()).toEqual({ markdown: "tab only", persistence: "tab" });
  });

  it("clears profile and tab copies", () => {
    const drafts = createDraftStorage();
    drafts.scheduleSave("secret");
    vi.advanceTimersByTime(500);
    expect(drafts.clear()).toEqual({ ok: true });
    expect(drafts.restore()).toEqual({ markdown: "", persistence: "profile" });
  });
});
