import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs"; // 중요: Edge 금지
export async function GET() {
  const [users, listings, reservations] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.reservation.count(),
  ]);
  return NextResponse.json({ ok: true, users, listings, reservations });
}