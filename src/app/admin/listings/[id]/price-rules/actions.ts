"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/admin";

export async function createPriceRule(formData: FormData) {
  await assertAdmin();
  const listingId = String(formData.get("listingId") || "");
  const startDate = String(formData.get("startDate") || "");
  const endDate = String(formData.get("endDate") || "");
  const type = String(formData.get("type") || "OVERRIDE") as "OVERRIDE" | "PERCENT";
  const value = Number(formData.get("value") || 0);
  const label = String(formData.get("label") || "").trim();

  if (!listingId || !startDate || !endDate || value === 0) {
    throw new Error("필수 필드를 입력해주세요.");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    throw new Error("종료일은 시작일 이후여야 합니다.");
  }

  await prisma.priceRule.create({
    data: {
      listingId,
      startDate: start,
      endDate: end,
      type,
      value,
      label: label || null,
    },
  });

  redirect(`/admin/listings/${listingId}/price-rules`);
}

export async function deletePriceRule(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") || "");
  const listingId = String(formData.get("listingId") || "");

  if (!id) {
    throw new Error("잘못된 요청입니다.");
  }

  await prisma.priceRule.delete({ where: { id } });

  redirect(`/admin/listings/${listingId}/price-rules`);
}
