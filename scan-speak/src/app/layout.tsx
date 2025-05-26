import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Scan & Speak - Multilingual Shopping Assistant",
  description: "Transform any device into a multilingual shopping assistant. Get product information in 100+ languages instantly.",
  keywords: "shopping assistant, multilingual, product scanner, voice shopping, AI assistant",
  authors: [{ name: "Scan & Speak Team" }],
  openGraph: {
    title: "Scan & Speak - Shop in Any Language",
    description: "Get instant product information in your language. No sign-ups, just answers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
