"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/admin";
import { CalendarBlockForm, formStr } from "@/lib/validators";

export async function createCalendarBlock(formData: FormData) {
  await assertAdmin();

  const parsed = CalendarBlockForm.parse({
    listingId: formStr(formData, "listingId"),
    startDate: formStr(formData, "startDate"),
    endDate: formStr(formData, "endDate"),
    reason: formStr(formData, "reason") || undefined,
  });

  await prisma.calendarBlock.create({
    data: {
      listingId: parsed.listingId,
      startDate: new Date(parsed.startDate),
      endDate: new Date(parsed.endDate),
      reason: parsed.reason || null,
    },
  });

  redirect(`/admin/listings/${parsed.listingId}/calendar-blocks`);
}

export async function deleteCalendarBlock(formData: FormData) {
  await assertAdmin();
  const id = formStr(formData, "id");
  const listingId = formStr(formData, "listingId");
  if (!id) throw new Error("잘못된 요청입니다.");

  await prisma.calendarBlock.delete({ where: { id } });

  redirect(`/admin/listings/${listingId}/calendar-blocks`);
}
