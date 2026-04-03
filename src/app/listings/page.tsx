// src/app/listings/page.tsx (대략 예시)
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listing/ListingCard";

export default async function ListingsPage() {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">숙소 목록</h1>
        <p className="text-sm text-slate-600">
          원하는 날짜에 맞는 숙소를 찾아보세요.
        </p>
      </header>
    <div className="grid gap-4 md:grid-cols-2">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
    </div>
  );
}
