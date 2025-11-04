import { NextResponse } from "next/server";
import { memoryDB } from "@/lib/mock";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const r = memoryDB.reservations.get(params.id);
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(r);
}

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const r = memoryDB.reservations.get(params.id);
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  r.status = "CONFIRMED";
  memoryDB.reservations.set(params.id, r);
  return NextResponse.json(r);
}

export const runtime = "nodejs";
