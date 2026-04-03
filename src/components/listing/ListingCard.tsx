// src/components/listing/ListingCard.tsx
import Link from "next/link";
import type { Listing } from "@prisma/client";

type ListingCardProps = {
listing: Listing;
};

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      data-testid={`listing-link-${listing.id}`} 
      className="border rounded-lg p-4 flex flex-col gap-2 bg-white hover:shadow-sm transition"
    >
      <h2 className="text-lg font-semibold">{listing.title}</h2>
      <p className="text-sm text-slate-600">{listing.location}</p>
      <p className="text-sm text-slate-800 font-bold">
        ₩{listing.nightlyPrice?.toLocaleString()} / 박
      </p>
    </Link>
  );
}
