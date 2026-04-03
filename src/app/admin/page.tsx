// src/app/admin/page.tsx
import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <header className="space-y-1 border-b pb-4">
        <h1 className="text-2xl font-semibold">관리자 대시보드</h1>
        <p className="text-sm text-slate-600">
          숙소와 예약을 관리하는 간단한 관리자 화면입니다.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/listings"
          className="rounded-2xl border bg-white p-4 hover:shadow-sm"
        >
          <h2 className="text-sm font-semibold">숙소 관리</h2>
          <p className="mt-1 text-xs text-slate-600">
            숙소를 등록·수정·삭제할 수 있습니다.
          </p>
        </Link>

        <Link
          href="/admin/reservations"
          className="rounded-2xl border bg-white p-4 hover:shadow-sm"
        >
          <h2 className="text-sm font-semibold">예약 관리</h2>
          <p className="mt-1 text-xs text-slate-600">
            생성된 예약을 한눈에 확인할 수 있습니다.
          </p>
        </Link>
      </section>
    </div>
  );
}
