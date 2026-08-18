import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SubMe — St. Francis Episcopal School",
  description: "SubMe, the substitute scheduling portal for St. Francis Episcopal School",
};

// Ported components reference the literal family names "Barlow" and "PT Serif"
// in inline styles throughout (matching the prototype) rather than a CSS
// variable, so these are loaded as a global stylesheet link instead of
// next/font — that's what actually registers those names browser-wide.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,600;0,700;0,800;1,400&family=PT+Serif:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
