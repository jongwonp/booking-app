import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateReservation } from "@/lib/validators";
import { overlapWhere } from "@/lib/overlap";
import { calcTotal } from "@/lib/pricing";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const v = CreateReservation.parse(await req.json());
    const checkIn = new Date(v.checkIn);
    const checkOut = new Date(v.checkOut);

    const reservation = await prisma.$transaction(
      async (tx) => {
        const [listing, user] = await Promise.all([
          tx.listing.findUnique({ where: { id: v.listingId } }),
          tx.user.upsert({
            where: { id: v.userId },
            create: { id: v.userId, email: `${v.userId}@demo.local` },
            update: {},
          }),
        ]);

        if (!listing || !user) {
          // → 나중에 catch에서 400 처리
          throw new Error("invalid-refs");
        }

        const hasOverlap = await tx.reservation.findFirst({
          where: overlapWhere(v.listingId, checkIn, checkOut),
        });

        if (hasOverlap) {
          // → 나중에 catch에서 409 처리
          throw new Error("conflict");
        }

        const totalPrice = calcTotal(listing.nightlyPrice, checkIn, checkOut);

        // 선택해서 반환할 필드만
        const r = await tx.reservation.create({
          data: {
            listingId: v.listingId,
            userId: v.userId,
            checkIn,
            checkOut,
            status: "HOLD",
            holdExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
            totalPrice,
          },
          select: { id: true, status: true, totalPrice: true },
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
