import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConverterWidget } from "@/view/widgets/ConverterWidget/ConverterWidget";

afterEach(cleanup);

describe("ConverterWidget", () => {
  it("publishes readiness only after client restoration completes", async () => {
    render(<ConverterWidget />);

    expect(screen.getByRole("region", { name: "Markdown converter" })).toHaveAttribute(
      "data-hydrated",
      "false",
    );
    await waitFor(() => {
      expect(screen.getByRole("region", { name: "Markdown converter" })).toHaveAttribute(
        "data-hydrated",
        "true",
      );
    });
  });

  it("synchronizes the semantic editor, preview, and selectable HTML", () => {
    render(<ConverterWidget />);
    const editor = screen.getByRole("textbox", { name: "Markdown" });
    fireEvent.change(editor, { target: { value: "~~done~~" } });
    expect(screen.getByRole("region", { name: "Preview" })).toHaveTextContent("done");
    expect(screen.getByRole("textbox", { name: "Generated HTML" })).toHaveValue(
      "<p><del>done</del></p>",
    );
  });

  it("switches output mode with native keyboard-operable controls", () => {
    render(<ConverterWidget />);
    fireEvent.change(screen.getByRole("textbox", { name: "Markdown" }), { target: { value: "Hi" } });
    fireEvent.click(screen.getByRole("radio", { name: "Full document" }));
    expect(
      (screen.getByRole("textbox", { name: "Generated HTML" }) as HTMLTextAreaElement).value,
    ).toContain("<!doctype html>");
  });

  it("announces grouped sanitization details without input excerpts", () => {
    render(<ConverterWidget />);
    fireEvent.change(screen.getByRole("textbox", { name: "Markdown" }), {
      target: { value: "<script>private()</script>\n\n<img src=x>\n\n[unsafe](javascript:private())" },
    });
    const notice = screen.getByText("3 transformations made").closest("details");
    expect(notice).not.toBeNull();
    expect(within(notice!).getByText("Escaped raw HTML (2)")).toBeInTheDocument();
    expect(within(notice!).getByText("Removed unsafe URL (1)")).toBeInTheDocument();
    expect(within(notice!).getByText("Line 1, column 1")).toBeInTheDocument();
    expect(within(notice!).getByText("Line 3, column 1")).toBeInTheDocument();
    expect(notice).not.toHaveTextContent("private()");
  });

  it("keeps a persistent warning visible after profile autosave fails", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });

    render(<ConverterWidget />);
    fireEvent.change(screen.getByRole("textbox", { name: "Markdown" }), {
      target: { value: "runtime only" },
    });

    expect(await screen.findByText(/retained only in the current tab/i, {}, { timeout: 1_000 })).toBeVisible();
    setItem.mockRestore();
  });

  it("announces the oversize boundary without blocking editing", () => {
    render(<ConverterWidget />);
    const editor = screen.getByRole("textbox", { name: "Markdown" });
    fireEvent.change(editor, { target: { value: "a".repeat(100_001) } });
    expect(editor).toHaveValue("a".repeat(100_001));
    expect(screen.getByRole("status")).toHaveTextContent("100,000 Unicode code points");
  });

  it("confirms copy only after the dual-MIME write succeeds", async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { write } });
    render(<ConverterWidget />);
    fireEvent.change(screen.getByRole("textbox", { name: "Markdown" }), { target: { value: "Copy" } });
    fireEvent.click(screen.getByRole("button", { name: "Copy HTML" }));
    expect(await screen.findByText("HTML copied")).toBeInTheDocument();
    expect(write).toHaveBeenCalledTimes(1);
  });

  it("focuses and selects the existing output when copy fails", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { write: vi.fn().mockRejectedValue(new Error("failed")) } });
    render(<ConverterWidget />);
    fireEvent.change(screen.getByRole("textbox", { name: "Markdown" }), { target: { value: "Copy" } });
    fireEvent.click(screen.getByRole("button", { name: "Copy HTML" }));
    const output = screen.getByRole("textbox", { name: "Generated HTML" }) as HTMLTextAreaElement;
    expect(await screen.findByText("Copy failed. The HTML is selected for manual copying.")).toBeInTheDocument();
    expect(output).toHaveFocus();
    expect(output.selectionEnd).toBe(output.value.length);
  });

  it("clears input and every retained draft copy without recreating records", async () => {
    render(<ConverterWidget />);
    fireEvent.change(screen.getByRole("textbox", { name: "Markdown" }), { target: { value: "Remove" } });
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByRole("textbox", { name: "Markdown" })).toHaveValue("");
    await new Promise((resolve) => setTimeout(resolve, 550));
    expect(localStorage.getItem("markdown-html:latest-draft")).toBeNull();
    expect(sessionStorage.getItem("markdown-html:tab-draft")).toBeNull();
  });
});
