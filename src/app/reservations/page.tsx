// src/app/reservations/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";

export default async function MyReservationsPage() {
  const session = await auth();
  const reservations = await prisma.reservation.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (reservations.length === 0) {
    return (
      <div className="mx-auto max-w-xl space-y-4 rounded-2xl border bg-white px-6 py-8 text-center">
        <h1 className="text-lg font-semibold">내 예약</h1>
        <p className="text-sm text-slate-600">
          아직 예약한 숙소가 없습니다. 마음에 드는 숙소를 찾아보세요!
        </p>
        <Link
          href="/listings"
          className="inline-flex items-center justify-center rounded-full bg-indigo-900 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800"
        >
          숙소 둘러보기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">내 예약</h1>
      <div className="space-y-3">
        {reservations.map((r) => (
          <Link
            key={r.id}
            href={`/reservations/${r.id}`}
            className="block rounded-xl border bg-white px-4 py-3 hover:shadow-sm"
          >
            <div className="text-sm text-slate-500">
              {r.checkIn.toDateString()} ~ {r.checkOut.toDateString()}
            </div>
            <div className="text-xs text-slate-500">
              상태: <span className="font-semibold">{r.status}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
