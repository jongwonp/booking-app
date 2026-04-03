// src/app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
