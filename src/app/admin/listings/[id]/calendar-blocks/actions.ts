"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/admin";

export async function createCalendarBlock(formData: FormData) {
  await assertAdmin();
  const listingId = String(formData.get("listingId") || "");
  const startDate = String(formData.get("startDate") || "");
  const endDate = String(formData.get("endDate") || "");
  const reason = String(formData.get("reason") || "").trim();

  if (!listingId || !startDate || !endDate) {
    throw new Error("필수 필드를 입력해주세요.");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    throw new Error("종료일은 시작일 이후여야 합니다.");
  }

  await prisma.calendarBlock.create({
    data: {
      listingId,
      startDate: start,
      endDate: end,
      reason: reason || null,
    },
  });

  redirect(`/admin/listings/${listingId}/calendar-blocks`);
}

export async function deleteCalendarBlock(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") || "");
  const listingId = String(formData.get("listingId") || "");

  if (!id) {
    throw new Error("잘못된 요청입니다.");
  }

  await prisma.calendarBlock.delete({ where: { id } });

  redirect(`/admin/listings/${listingId}/calendar-blocks`);
}
