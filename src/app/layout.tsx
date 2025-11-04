import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="mx-auto max-w-3xl p-6">
        <header className="flex items-center justify-between pb-6 border-b mb-6">
          <Link href="/" className="text-xl font-bold">
            Booking App (라이트)
          </Link>
          <nav className="text-sm space-x-4">
            <Link href="/">홈</Link>
            <Link href="/api/health" target="_blank" rel="noreferrer">
              헬스체크
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
