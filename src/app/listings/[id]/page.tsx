import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { toDateOnlyUTC } from "@/lib/date";
import ReservationWidget from "@/components/reservation/ReservationWidget";
export const runtime = "nodejs";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const [listing, reservations, calendarBlocks, priceRules] = await Promise.all([
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
    prisma.calendarBlock.findMany({
      where: {
        listingId: id,
        endDate: { gte: new Date() },
      },
      select: { startDate: true, endDate: true },
    }),
    prisma.priceRule.findMany({
      where: {
        listingId: id,
        endDate: { gte: new Date() },
      },
      select: { startDate: true, endDate: true, type: true, value: true },
    }),
  ]);

  const bookedRanges = reservations.map((r) => ({
    from: toDateOnlyUTC(r.checkIn),
    to: toDateOnlyUTC(r.checkOut),
  }));

  const blockedRanges = calendarBlocks.map((b) => ({
    from: toDateOnlyUTC(b.startDate),
    to: toDateOnlyUTC(b.endDate),
  }));

  const serializedPriceRules = priceRules.map((r) => ({
    startDate: toDateOnlyUTC(r.startDate),
    endDate: toDateOnlyUTC(r.endDate),
    type: r.type,
    value: r.value,
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

      {listing.imageUrls.length > 0 ? (
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
          {listing.imageUrls.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`${listing.title} 이미지 ${i + 1}`}
              className="w-full h-48 object-cover rounded-lg"
            />
          ))}
        </div>
      ) : (
        <div className="w-full h-56 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-sm">
          이미지 없음
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <section className="space-y-4">
          <p className="text-sm text-slate-700 whitespace-pre-line">
            {listing.description}
          </p>
        </section>

        <aside>
          {session?.user ? (
            <ReservationWidget
              listingId={listing.id}
              nightlyPrice={listing.nightlyPrice}
              bookedRanges={bookedRanges}
              blockedRanges={blockedRanges}
              priceRules={serializedPriceRules}
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
