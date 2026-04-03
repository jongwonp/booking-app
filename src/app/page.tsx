// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-5xl flex-col justify-center px-4">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          숙소 예약 앱
        </h1>
        <p className="max-w-xl text-sm text-slate-600">
          리스트 → 상세 → 예약 생성/확정까지 한 번에 경험해볼 수 있는 숙소 예약 서비스입니다.
        </p>

        <div className="flex gap-3">
          <Link
            href="/listings"
            className="inline-flex items-center rounded-full bg-indigo-900 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800"
          >
            숙소 둘러보기
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            관리자 화면
          </Link>
        </div>
      </section>
    </main>
  );
}
