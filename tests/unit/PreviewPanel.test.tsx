import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PreviewPanel } from "@/view/components/PreviewPanel";

afterEach(cleanup);

function frame() {
  return screen.getByTestId("preview-frame");
}

describe("PreviewPanel width", () => {
  it("starts at full width", () => {
    render(<PreviewPanel html="<p>Hi</p>" />);

    expect(screen.getByRole("button", { name: "Full" })).toHaveAttribute("aria-pressed", "true");
    expect(frame().style.width).toBe("");
  });

  it("narrows the preview to a preset and back", () => {
    render(<PreviewPanel html="<p>Hi</p>" />);

    fireEvent.click(screen.getByRole("button", { name: "Mobile" }));
    expect(frame().style.width).toBe("375px");
    expect(screen.getByRole("button", { name: "Mobile" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Full" })).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(screen.getByRole("button", { name: "Tablet" }));
    expect(frame().style.width).toBe("768px");

    fireEvent.click(screen.getByRole("button", { name: "Full" }));
    expect(frame().style.width).toBe("");
  });

  it("reapplies a preset after the frame was resized by hand", () => {
    render(<PreviewPanel html="<p>Hi</p>" />);
    fireEvent.click(screen.getByRole("button", { name: "Mobile" }));

    frame().style.width = "500px";
    fireEvent.click(screen.getByRole("button", { name: "Mobile" }));

    expect(frame().style.width).toBe("375px");
  });
});
