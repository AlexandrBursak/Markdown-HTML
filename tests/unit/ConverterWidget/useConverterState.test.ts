import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useConverterState } from "@/view/widgets/ConverterWidget/useConverterState";

describe("useConverterState", () => {
  it("restores and converts the initial completed input", () => {
    const { result } = renderHook(() => useConverterState({ initialMarkdown: "**saved**" }));
    expect(result.current.markdown).toBe("**saved**");
    expect(result.current.result.html).toContain("<strong>saved</strong>");
    expect(result.current.canCopy).toBe(true);
  });

  it("ignores intermediate composition and converts on completion", () => {
    const { result } = renderHook(() => useConverterState());
    act(() => result.current.updateMarkdown("intermediate", true));
    expect(result.current.markdown).toBe("");
    act(() => result.current.updateMarkdown("complete", false));
    expect(result.current.markdown).toBe("complete");
    expect(result.current.result.revision).toBe(1);
  });

  it("keeps mode, revision, and Unicode size gates synchronized", () => {
    const { result } = renderHook(() => useConverterState());
    act(() => result.current.updateMarkdown("😀", false));
    act(() => result.current.setMode("document"));
    expect(result.current.result.mode).toBe("document");
    expect(result.current.canCopy).toBe(true);
    expect(result.current.codePointCount).toBe(1);
    act(() => result.current.updateMarkdown("a".repeat(100_001), false));
    expect(result.current.isOversize).toBe(true);
  });
});
