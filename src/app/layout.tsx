import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CurbSitter | Premium Trash Day Valet & Concierge Services",
  description: "CurbSitter is the premium trash-to-curb valet concierge service for Prescott, AZ. Never miss trash day again with our automated photo verification and peace of mind.",
  keywords: ["trash day valet", "bin rollout service", "residential waste concierge", "Prescott AZ waste", "CurbSitter"],
  authors: [{ name: "CurbSitter Team" }],
  openGraph: {
    title: "CurbSitter | Premium Trash Day Valet",
    description: "Never miss trash day again. Premium bins out, bins back valet concierge service with automated proof-of-work photo verification.",
    type: "website",
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
      className={`${inter.variable} h-full antialiased overflow-x-clip`}
    >
      <body className="min-h-full flex flex-col font-sans text-foreground overflow-x-clip">
        {children}
      </body>
    </html>
  );
}
