import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Powers",
  description: "Interactive geopolitical power mapping",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="noise-overlay" />
        <nav className="fixed top-0 left-0 right-0 z-40 bg-bg-primary/80 backdrop-blur-md border-b border-white/5">
          <div className="max-w-[1800px] mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="font-display font-bold text-lg tracking-tight text-white hover:text-accent-blue transition-colors">
              POWERS
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm font-body text-slate-400 hover:text-white transition-colors">
                Map
              </Link>
              <div className="relative group">
                <button className="text-sm font-body text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                  Regions
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full right-0 mt-2 py-2 w-48 bg-bg-card border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link href="/regions/red-sea" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5">
                    The Red Sea
                  </Link>
                  <Link href="/regions/balkans" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5">
                    The Balkans
                  </Link>
                  <Link href="/regions/eastern-europe" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5">
                    Eastern Europe
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="relative z-10 pt-14">
          {children}
        </main>
      </body>
    </html>
  );
}
