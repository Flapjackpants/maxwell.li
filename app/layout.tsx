import type { Metadata } from "next";
import { Bodoni_Moda, JetBrains_Mono, VT323 } from "next/font/google";
import { retroFont } from "@/lib/retro-font";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-accent",
  subsets: ["latin"],
  display: "swap",
});

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  display: "swap",
});

const vt323 = VT323({
  weight: "400",
  variable: "--font-vt323",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Engineering the future — portfolio and selected work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${bodoniModa.variable} ${vt323.variable} ${retroFont.variable} h-full antialiased`}
    >
      <body className="portfolio-body-shell min-h-full">{children}</body>
    </html>
  );
}
