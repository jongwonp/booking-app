import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import ReservationWidget from "@/components/reservation/ReservationWidget";
export const runtime = "nodejs";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const [listing, reservations] = await Promise.all([
    prisma.listing.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        location: true,
        nightlyPrice: true,
        imageUrls: true,
        maxGuests: true,
        description: true,
      },
    }),
    prisma.reservation.findMany({
      where: {
        listingId: id,
        status: { in: ["HOLD", "CONFIRMED"] },
        checkOut: { gte: new Date() },
      },
      select: { checkIn: true, checkOut: true },
    }),
  ]);

  const bookedRanges = reservations.map((r) => ({
    from: r.checkIn.toISOString(),
    to: r.checkOut.toISOString(),
  }));
  if (!listing) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-xl font-semibold">숙소를 찾을 수 없습니다</h1>
        <p className="mt-2 text-sm text-slate-600">
          링크가 잘못되었거나, 숙소가 삭제되었을 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="space-y-1 border-b pb-4">
        <h1 className="text-2xl font-semibold">{listing.title}</h1>
        <p className="text-sm text-slate-600">{listing.location}</p>
        <p className="text-sm font-medium text-slate-800">
          ₩{listing.nightlyPrice.toLocaleString()} / 박 · 최대{" "}
          {listing.maxGuests}명
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <section className="space-y-4">
          {/* 상세 설명 / 이미지 등 기존 내용 */}
          <p className="text-sm text-slate-700 whitespace-pre-line">
            {listing.description}
          </p>
        </section>

        <aside>
          {session?.user ? (
            <ReservationWidget
              listingId={listing.id}
              userId={session.user.id!}
              nightlyPrice={listing.nightlyPrice}
              bookedRanges={bookedRanges}
            />
          ) : (
            <div className="rounded-xl border p-6 text-center space-y-3">
              <p className="text-sm text-slate-600">예약하려면 로그인이 필요합니다.</p>
              <a href="/login" className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
                로그인
              </a>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
