// src/components/layout/Header.tsx
"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold">
          Booking App
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/listings">숙소 목록</Link>
          <Link href="/reservations">내 예약</Link>
          <Link href="/admin/listings">관리자</Link>
        </nav>
      </div>
    </header>
  );
}
