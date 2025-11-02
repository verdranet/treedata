import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MintZero Donation Console",
  description:
    "Monitor creator fee donations and carbon-impact partners across the MintZero network."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
