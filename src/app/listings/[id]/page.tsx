// src/app/listings/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import ReservationWidget from "@/components/reservation/ReservationWidget";
export const runtime = "nodejs";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
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
  });
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
          <ReservationWidget
            listingId={listing.id}
            userId={"demo-user"} // 지금은 하드코딩 유저
            nightlyPrice={listing.nightlyPrice}
          />
        </aside>
      </div>
    </div>
  );
}
