export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    total: items.length,
    ids: items.map((l) => l.id),
    items,
  });
}
