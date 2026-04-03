import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";
export async function PATCH(_: Request, { params }: { params:{ id:string } }) {
  const { id } = await params; 
  const r = await prisma.reservation.update({
    where:{ id}, data:{ status:"CANCELLED" },
    select:{ id:true, status:true }
  }).catch(()=>null);
  if (!r) return NextResponse.json({ error:"not found" }, { status:404 });
  return NextResponse.json(r);
}