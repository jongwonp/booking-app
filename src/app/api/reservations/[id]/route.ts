export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const r = await prisma.reservation.findUnique({ where: { id } });
  if (!r) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true, data: r });
}

export async function PATCH(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const r = await prisma.reservation.findUnique({ where: { id } });
  if (!r) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  if (r.status === "HOLD") {
    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: "CONFIRMED" },
      select: { id: true, status: true, totalPrice: true },
    });
    return NextResponse.json({ ok: true, data: updated });
  }
  return NextResponse.json({ ok: true, data: r });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const r = await prisma.reservation.findUnique({ where: { id } });
  if (!r) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  await prisma.reservation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
