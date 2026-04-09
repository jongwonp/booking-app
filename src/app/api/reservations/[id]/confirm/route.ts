// src/app/api/reservations/[id]/confirm/route.ts  (PATCH)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReservationStatus } from "@prisma/client";
import { overlapWhere } from "@/lib/overlap";
import { calcTotal } from "@/lib/pricing";
import { rateLimit } from "@/lib/rate-limit";
export const runtime = "nodejs";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(_req, { max: 10, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const out = await prisma.$transaction(async (tx) => {
      const { id } = await params;
      const r = await tx.reservation.findUnique({ where: { id } });
      if (!r) return { status: 404 as const, body: { error: "not found" } };
      if (r.holdExpiresAt && r.holdExpiresAt < new Date())
        return { status: 410 as const, body: { error: "hold-expired" } };
      if (r.status !== "HOLD")
        return { status: 409 as const, body: { error: "conflict" } };

      // 최신 겹침 재검증
      const overlap = await tx.reservation.findFirst({
        where: overlapWhere(r.listingId, r.checkIn, r.checkOut, r.id),
      });
      if (overlap) return { status: 409 as const, body: { error: "conflict" } };

      // totalPrice 보정(혹시 0이면 계산)
      let total = r.totalPrice;
      if (!total) {
        const listing = await tx.listing.findUnique({ where: { id: r.listingId }, select: { nightlyPrice: true } });
        if (!listing) return { status: 400 as const, body: { error: "listing missing" } };
        total = calcTotal(listing.nightlyPrice, r.checkIn, r.checkOut);
      }

      const u = await tx.reservation.update({
        where: { id: r.id },
        data: { status: ReservationStatus.CONFIRMED, totalPrice: total },
        select: { id: true, status: true, totalPrice: true },
      });
      return { status: 200 as const, body: u };
    }, { isolationLevel: "Serializable" });

    if (out.status === 200) {
      return NextResponse.json({ ok: true, data: out.body }, { status: 200 });
    }
    return NextResponse.json({ ok: false, error: out.body.error }, { status: out.status });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }
}
