import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://blobgen.ai"),
  title: {
    default: "blobgen.ai — Keyword in. YouTube Short out.",
    template: "%s · blobgen.ai",
  },
  description:
    "blobgen.ai turns any topic into a finished YouTube Short—script, voiceover, visuals, captions, and upload or schedule. All on autopilot.",
  keywords: [
    "YouTube Shorts",
    "AI video generator",
    "faceless channel",
    "short form video",
    "content automation",
    "auto-publish",
  ],
  openGraph: {
    title: "blobgen.ai — Keyword in. YouTube Short out.",
    description:
      "Turn any idea into high-quality YouTube Shorts—script, visuals, captions, and scheduling—on autopilot.",
    url: "https://blobgen.ai",
    siteName: "blobgen.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "blobgen.ai — Keyword in. YouTube Short out.",
    description:
      "Turn any idea into high-quality YouTube Shorts on autopilot.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
