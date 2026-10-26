import type { Metadata } from "next";
import type { ReactNode } from "react";

import { themeBootScript } from "@/shared/browser/themePreference";

import "./globals.css";

export const metadata: Metadata = {
  title: "Markdown to HTML",
  description: "Convert Markdown into safe HTML in your browser.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    // The boot script sets data-theme before hydration.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
