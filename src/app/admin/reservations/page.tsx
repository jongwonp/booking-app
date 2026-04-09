// src/app/admin/reservations/page.tsx
import { prisma } from "@/lib/prisma";
import { formatDateKR } from "@/lib/date";
import Link from "next/link";

export default async function AdminReservationsPage() {
  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
    include: { listing: true },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-8">
      <header className="space-y-1 border-b pb-4">
        <h1 className="text-xl font-semibold">예약 관리</h1>
        <p className="text-sm text-slate-600">
          생성된 예약을 상태별로 확인할 수 있습니다.
        </p>
      </header>

      {reservations.length === 0 ? (
        <div className="rounded-2xl border bg-white px-6 py-8 text-center">
          <p className="text-sm text-slate-600">아직 생성된 예약이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reservations.map((r) => (
            <Link
              key={r.id}
              href={`/reservations/${r.id}`}
              className="block rounded-xl border bg-white px-4 py-3 hover:shadow-sm"
            >
              <div className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">
                    {r.listing?.title ?? "삭제된 숙소"}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatDateKR(r.checkIn)} ~ {formatDateKR(r.checkOut)}
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-700">
                  {r.status}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
