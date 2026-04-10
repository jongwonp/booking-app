import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateReservation } from "@/lib/validators";
import { overlapWhere, calendarBlockOverlapWhere } from "@/lib/overlap";
import { calcTotalWithRules } from "@/lib/pricing";
import { parseUTCDate } from "@/lib/date";
import { rateLimit } from "@/lib/rate-limit";
import { auth } from "@/auth";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const limited = rateLimit(req, { max: 10, windowMs: 60_000 });
  if (limited) return limited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }
  const userId = session.user.id;

  try {
    const v = CreateReservation.parse(await req.json());
    const checkIn = parseUTCDate(v.checkIn);
    const checkOut = parseUTCDate(v.checkOut);

    const reservation = await prisma.$transaction(
      async (tx) => {
        const listing = await tx.listing.findUnique({ where: { id: v.listingId } });

        if (!listing) {
          throw new Error("invalid-refs");
        }

        if (v.guests > listing.maxGuests) {
          throw new Error("too-many-guests");
        }

        const [hasOverlap, hasBlock] = await Promise.all([
          tx.reservation.findFirst({
            where: overlapWhere(v.listingId, checkIn, checkOut),
          }),
          tx.calendarBlock.findFirst({
            where: calendarBlockOverlapWhere(v.listingId, checkIn, checkOut),
          }),
        ]);

        if (hasBlock) {
          throw new Error("blocked");
        }

        if (hasOverlap) {
          throw new Error("conflict");
        }

        const priceRules = await tx.priceRule.findMany({
          where: {
            listingId: v.listingId,
            NOT: [
              { endDate: { lte: checkIn } },
              { startDate: { gte: checkOut } },
            ],
          },
        });

        const totalPrice = calcTotalWithRules(
          listing.nightlyPrice,
          checkIn,
          checkOut,
          priceRules,
        );

        // 선택해서 반환할 필드만
        const r = await tx.reservation.create({
          data: {
            listingId: v.listingId,
            userId,
            checkIn,
            checkOut,
            guests: v.guests,
            status: "HOLD",
            holdExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
            totalPrice,
          },
          select: { id: true, status: true, totalPrice: true, holdExpiresAt: true },
        });

        return r;
      },
      { isolationLevel: "Serializable" }
    );

    // ✅ 성공 응답: 항상 { ok: true, data: {...} }
    return NextResponse.json({ ok: true, data: reservation }, { status: 201 });
  } catch (e: any) {
    // ✅ 검증 실패 (Zod)
    if (e?.name === "ZodError") {
      return NextResponse.json(
        { ok: false, error: "validation", details: e.errors },
        { status: 400 }
      );
    }

    // ✅ listing/user 못 찾은 경우
    if (e?.message === "invalid-refs") {
      return NextResponse.json(
        { ok: false, error: "invalid-refs" },
        { status: 400 }
      );
    }

    // ✅ 인원이 숙소 최대 인원 초과
    if (e?.message === "too-many-guests") {
      return NextResponse.json(
        { ok: false, error: "too-many-guests" },
        { status: 400 }
      );
    }

    // ✅ 차단된 날짜
    if (e?.message === "blocked") {
      return NextResponse.json(
        { ok: false, error: "blocked" },
        { status: 409 }
      );
    }

    // ✅ 겹치는 예약
    if (e?.message === "conflict") {
      return NextResponse.json(
        { ok: false, error: "conflict" },
        { status: 409 }
      );
    }

    // ✅ 그 외 서버 에러
    console.error(e);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }
}
