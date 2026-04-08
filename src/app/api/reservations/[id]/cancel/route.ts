import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. 예약 조회
  const reservation = await prisma.reservation.findUnique({ where: { id } });

  // 2. 존재하지 않으면 404
  if (!reservation) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  // 3. 이미 취소된 예약이면 중복 처리 방지
  if (reservation.status === "CANCELLED") {
    return NextResponse.json({ ok: false, error: "already cancelled" }, { status: 409 });
  }

  // 4. 상태 변경
  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: "CANCELLED" },
    select: { id: true, status: true },
  });

  return NextResponse.json({ ok: true, data: updated });
}