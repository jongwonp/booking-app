import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";

export async function PATCH() {
  const { count } = await prisma.reservation.updateMany({
    where: { status: "HOLD", holdExpiresAt: { lt: new Date() } },
    data: { status: "CANCELLED" },
  });
  return NextResponse.json({ ok: true, cancelled: count });
}
