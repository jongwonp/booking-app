import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { formatDateKR } from "@/lib/date";
import Link from "next/link";

export default async function MyPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [user, reservationCounts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, createdAt: true },
    }),
    prisma.reservation.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
  ]);

  const counts = {
    HOLD: 0,
    CONFIRMED: 0,
    CANCELLED: 0,
    ...Object.fromEntries(
      reservationCounts.map((r) => [r.status, r._count]),
    ),
  };
  const total = counts.HOLD + counts.CONFIRMED + counts.CANCELLED;

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-8">
      <header className="space-y-1 border-b pb-4">
        <h1 className="text-2xl font-semibold">내 정보</h1>
      </header>

      <section className="space-y-3 rounded-xl border bg-white px-5 py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">이름</span>
          <span className="font-medium">{user?.name ?? "-"}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">이메일</span>
          <span className="font-medium">{user?.email ?? "-"}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">가입일</span>
          <span className="font-medium">
            {user?.createdAt ? formatDateKR(user.createdAt) : "-"}
          </span>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">예약 현황</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border bg-white px-4 py-3 text-center">
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-xs text-slate-500">전체</div>
          </div>
          <div className="rounded-xl border bg-white px-4 py-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {counts.HOLD}
            </div>
            <div className="text-xs text-slate-500">대기</div>
          </div>
          <div className="rounded-xl border bg-white px-4 py-3 text-center">
            <div className="text-2xl font-bold text-green-600">
              {counts.CONFIRMED}
            </div>
            <div className="text-xs text-slate-500">확정</div>
          </div>
          <div className="rounded-xl border bg-white px-4 py-3 text-center">
            <div className="text-2xl font-bold text-slate-400">
              {counts.CANCELLED}
            </div>
            <div className="text-xs text-slate-500">취소</div>
          </div>
        </div>

        <Link
          href="/reservations"
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
        >
          내 예약 보기 &rarr;
        </Link>
      </section>
    </div>
  );
}
