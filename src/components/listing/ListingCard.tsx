// src/components/listing/ListingCard.tsx
import Link from "next/link";
import type { Listing } from "@prisma/client";

type ListingCardProps = {
listing: Listing;
};

export function ListingCard({ listing }: ListingCardProps) {
  const thumbnail = listing.imageUrls?.[0];

  return (
    <Link
      href={`/listings/${listing.id}`}
      data-testid={`listing-link-${listing.id}`}
      className="border rounded-lg overflow-hidden flex flex-col bg-white hover:shadow-sm transition"
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={listing.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
          이미지 없음
        </div>
      )}
      <div className="p-4 flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{listing.title}</h2>
        <p className="text-sm text-slate-600">{listing.location}</p>
        <p className="text-sm text-slate-800 font-bold">
          ₩{listing.nightlyPrice?.toLocaleString()} / 박
        </p>
      </div>
    </Link>
  );
}
