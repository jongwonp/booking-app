import { NextResponse } from "next/server";
import { genId, listings, memoryDB, type Reservation } from "@/lib/mock";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const { listingId, checkIn, checkOut } = body || {};

  // 최소 유효성 검사
  const exists = listings.find((l) => l.id === listingId);
  if (!exists) {
    return NextResponse.json({ error: "Invalid listingId" }, { status: 400 });
  }

  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const id = genId("rsv");
  const rsv: Reservation = {
    id,
    listingId,
    status: "HOLD",
    checkIn: checkIn || iso(today),
    checkOut: checkOut || iso(new Date(today.getTime() + 86400000)),
    createdAt: Date.now(),
  };

  memoryDB.reservations.set(id, rsv);
  return NextResponse.json(rsv, { status: 201 });
}

export const runtime = "nodejs";
