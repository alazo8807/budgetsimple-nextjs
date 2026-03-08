import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "BudgetSimple",
  description: "Simple personal finance tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${dmSerif.variable} antialiased`}
      >
        <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="font-serif text-xl text-accent tracking-tight"
            >
              BudgetSimple
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/transactions"
                className="text-sm font-medium text-text-secondary hover:text-foreground transition-colors"
              >
                Transactions
              </Link>
              <Link
                href="/settings?tab=accounts"
                className="text-sm font-medium text-text-secondary hover:text-foreground transition-colors"
              >
                Settings
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
