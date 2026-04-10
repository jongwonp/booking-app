export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { auth } from "@/auth";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(_req, { max: 60, windowMs: 60_000 });
  if (limited) return limited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const r = await prisma.reservation.findUnique({ where: { id } });
  if (!r) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  // 본인 예약이거나 ADMIN만 조회 가능
  if (r.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  return NextResponse.json({ ok: true, data: r });
}

export async function PATCH(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(_req, { max: 10, windowMs: 60_000 });
  if (limited) return limited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const r = await prisma.reservation.findUnique({ where: { id } });
  if (!r) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  if (r.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

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
  const limited = rateLimit(_req, { max: 10, windowMs: 60_000 });
  if (limited) return limited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const r = await prisma.reservation.findUnique({ where: { id } });
  if (!r) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  if (r.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  await prisma.reservation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
