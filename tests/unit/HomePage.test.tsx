import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "@/app/page";
import { metadata } from "@/app/layout";

describe("HomePage", () => {
  it("renders a thin public route around the converter island", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: "Markdown to HTML" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Skip to converter" })).toHaveAttribute("href", "#converter");
    expect(screen.getByRole("navigation", { name: "RexSoft services" })).toHaveTextContent("Password Generator");
    expect(screen.getByRole("link", { name: "Password Generator" })).toHaveAttribute("href", "https://passgen.rexsoftproduction.com/");
    expect(screen.getByRole("link", { name: "Markdown to HTML" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("main")).toHaveAttribute("id", "converter");
    expect(screen.getByRole("region", { name: "Markdown converter" })).toBeInTheDocument();
  });

  it("provides stable server metadata", () => {
    expect(metadata).toMatchObject({
      title: "Markdown to HTML",
      description: "Convert Markdown into safe HTML in your browser.",
    });
  });
});
