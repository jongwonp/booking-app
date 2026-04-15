import { prisma } from "@/lib/prisma";
import { parseUTCDate } from "@/lib/date";
import { ListingCard } from "@/components/listing/ListingCard";
import ListingsFilter from "@/components/listing/ListingsFilter";
import Pagination from "@/components/ui/Pagination";
import { Suspense } from "react";

type SearchParams = {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  sort?: string;
  page?: string;
};

const PAGE_SIZE = 12;

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { location, checkIn, checkOut, guests, sort, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const sortOptions: Record<string, { orderBy: Record<string, "asc" | "desc"> }> = {
    newest: { orderBy: { createdAt: "desc" } },
    "price-asc": { orderBy: { nightlyPrice: "asc" } },
    "price-desc": { orderBy: { nightlyPrice: "desc" } },
    "guests-desc": { orderBy: { maxGuests: "desc" } },
  };
  const { orderBy } = sortOptions[sort ?? ""] ?? sortOptions.newest;

  const checkInDate = checkIn ? parseUTCDate(checkIn) : null;
  const checkOutDate = checkOut ? parseUTCDate(checkOut) : null;
  const guestsNum = guests ? parseInt(guests) : null;

  // 날짜 필터: 해당 기간에 겹치는 예약 또는 차단이 있는 listingId를 제외
  let excludedListingIds: string[] = [];
  if (checkInDate && checkOutDate && checkInDate < checkOutDate) {
    const now = new Date();
    const [overlapping, blocked] = await Promise.all([
      prisma.reservation.findMany({
        where: {
          // overlapWhere와 동일한 정책: 만료된 HOLD는 가용으로 본다.
          OR: [
            { status: "CONFIRMED" },
            { status: "HOLD", holdExpiresAt: { gt: now } },
          ],
          NOT: [
            { checkOut: { lte: checkInDate } },
            { checkIn: { gte: checkOutDate } },
          ],
        },
        select: { listingId: true },
      }),
      prisma.calendarBlock.findMany({
        where: {
          NOT: [
            { endDate: { lte: checkInDate } },
            { startDate: { gte: checkOutDate } },
          ],
        },
        select: { listingId: true },
      }),
    ]);
    excludedListingIds = [
      ...new Set([
        ...overlapping.map((r) => r.listingId),
        ...blocked.map((b) => b.listingId),
      ]),
    ];
  }

  const where = {
    isActive: true as const,
    ...(location && {
      location: { contains: location, mode: "insensitive" as const },
    }),
    ...(guestsNum && { maxGuests: { gte: guestsNum } }),
    ...(excludedListingIds.length > 0 && {
      id: { notIn: excludedListingIds },
    }),
  };

  const [listings, totalCount] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.listing.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasFilter = location || checkIn || checkOut || guests;

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">숙소 목록</h1>
        <p className="text-sm text-slate-600">
          원하는 날짜에 맞는 숙소를 찾아보세요.
        </p>
      </header>

      <Suspense>
        <ListingsFilter />
      </Suspense>

      {listings.length === 0 ? (
        <div className="rounded-xl border bg-white px-6 py-10 text-center text-sm text-slate-500">
          {hasFilter
            ? "조건에 맞는 숙소가 없습니다. 필터를 바꿔보세요."
            : "등록된 숙소가 없습니다."}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          )}
        </>
      )}
    </div>
  );
}
