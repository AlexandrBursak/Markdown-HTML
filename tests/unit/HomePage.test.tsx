import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import HomePage from "@/app/page";
import { metadata } from "@/app/layout";

describe("HomePage", () => {
  afterEach(cleanup);

  it("renders a thin public route around the converter island", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: "Markdown to HTML" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Skip to converter" })).toHaveAttribute("href", "#converter");
    expect(screen.getByRole("navigation", { name: "RexSoft services" })).toHaveTextContent("Password Generator");
    expect(screen.getByRole("link", { name: "Password Generator" })).toHaveAttribute("href", "https://passgen.rexsoftproduction.com/");
    expect(screen.getByRole("link", { name: "Markdown to HTML" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Snap Link" })).toHaveAttribute("href", "https://snap-link.rexsoftproduction.com/");
    expect(screen.getByRole("group", { name: "Theme" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("id", "converter");
    expect(within(screen.getByRole("main")).getByRole("heading", { level: 1 })).toHaveTextContent("Markdown to HTML");
    expect(screen.getByRole("region", { name: "Markdown converter" })).toBeInTheDocument();
  });

  it("shares one service header layout with the other RexSoft services", () => {
    render(<HomePage />);
    const nav = screen.getByRole("navigation", { name: "RexSoft services" });
    const banner = nav.closest("header")!;

    expect(within(nav).getAllByRole("link").map((link) => link.textContent)).toEqual([
      "Password Generator",
      "Markdown to HTML",
      "Snap Link",
    ]);
    expect(within(banner).getByRole("group", { name: "Theme" })).toBeInTheDocument();
    expect(within(banner).queryByRole("heading")).not.toBeInTheDocument();
  });

  it("ends with the shared RexSoft footer", () => {
    render(<HomePage />);

    expect(screen.getByRole("contentinfo")).toHaveTextContent(`© ${new Date().getFullYear()} RexSoft`);
  });

  it("provides stable server metadata", () => {
    expect(metadata).toMatchObject({
      title: "Markdown to HTML",
      description: "Convert Markdown into safe HTML in your browser.",
    });
  });
});
