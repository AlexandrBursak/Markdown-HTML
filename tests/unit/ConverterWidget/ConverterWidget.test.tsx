import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

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
});
