import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ThemeControl } from "@/view/components/ThemeControl";

beforeEach(() => {
  window.localStorage.clear();
  delete document.documentElement.dataset.theme;
});
afterEach(cleanup);

describe("ThemeControl", () => {
  it("starts on the stored choice", () => {
    window.localStorage.setItem("markdown-html:theme", "dark");
    render(<ThemeControl />);

    expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked();
  });

  it("switches the page to light and remembers it", () => {
    render(<ThemeControl />);
    expect(screen.getByRole("radio", { name: "System" })).toBeChecked();

    fireEvent.click(screen.getByRole("radio", { name: "Light" }));

    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(window.localStorage.getItem("markdown-html:theme")).toBe("light");
  });
});
