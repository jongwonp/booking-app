export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
// ⬇️ 여러분 프로젝트에서 listings를 어디서 export하는지 맞춰주세요.
import { listings } from "@/lib/data"; // 또는 "@/lib/mock"

export async function GET() {
  return NextResponse.json({
    total: listings.length,
    ids: listings.map(l => l.id),
    items: listings,
  });
}
