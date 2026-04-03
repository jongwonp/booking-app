import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function ReservationDetailPage({ params }: Props) {
  const { id } = await params;
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { listing: true },
  });

  if (!reservation) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <h1 className="text-xl font-semibold">예약을 찾을 수 없습니다</h1>
        <p className="mt-2 text-sm text-slate-600">
          링크가 잘못되었거나, 예약이 취소되었을 수 있습니다.
        </p>
      </div>
    );
  }

  const { listing } = reservation;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <header className="space-y-1 border-b pb-4">
        <h1 className="text-2xl font-semibold">예약 상세</h1>
        {listing && (
          <p className="text-sm text-slate-600">
            숙소: <span className="font-medium">{listing.title}</span>
          </p>
        )}
        <p className="text-xs text-slate-500">ID: {reservation.id}</p>
      </header>

      <section className="space-y-2 text-sm text-slate-700">
        <p>
          기간: {reservation.checkIn.toDateString()} ~{" "}
          {reservation.checkOut.toDateString()}
        </p>
        <p>
          인원: <span className="font-medium">{reservation.guests ?? 1}명</span>
        </p>
        <p>
          상태: <span className="font-semibold">{reservation.status}</span>
        </p>
      </section>

      {/* 필요하면 여기 아래에 확정/취소 버튼 추가 (지금은 ReservationWidget에서 처리 중) */}
    </div>
  );
}
