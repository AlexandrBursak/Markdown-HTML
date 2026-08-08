import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConverterWidget } from "@/view/widgets/ConverterWidget/ConverterWidget";

afterEach(cleanup);

describe("ConverterWidget", () => {
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
      target: { value: "<script>private()</script>" },
    });
    const notice = screen.getByText("1 transformation made").closest("details");
    expect(notice).not.toBeNull();
    expect(within(notice!).getByText("Escaped raw HTML: line 1, column 1")).toBeInTheDocument();
    expect(notice).not.toHaveTextContent("private()");
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

  it("clears input and every retained draft copy", () => {
    render(<ConverterWidget />);
    fireEvent.change(screen.getByRole("textbox", { name: "Markdown" }), { target: { value: "Remove" } });
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByRole("textbox", { name: "Markdown" })).toHaveValue("");
    expect(localStorage.getItem("markdown-html:latest-draft")).toBeNull();
    expect(sessionStorage.getItem("markdown-html:tab-draft")).toBeNull();
  });
});
