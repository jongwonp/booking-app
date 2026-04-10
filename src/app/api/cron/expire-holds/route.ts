import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";

export async function PATCH(req: Request) {
  // CRON_SECRET 환경변수로 보호.
  // Vercel Cron은 자동으로 Authorization: Bearer <CRON_SECRET> 헤더를 붙여 호출한다.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "cron not configured" },
      { status: 500 },
    );
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  const { count } = await prisma.reservation.updateMany({
    where: { status: "HOLD", holdExpiresAt: { lt: new Date() } },
    data: { status: "CANCELLED" },
  });
  return NextResponse.json({ ok: true, cancelled: count });
}
