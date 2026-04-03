"use server";

import { prisma } from "@/lib/prisma"; // 경로는 프로젝트에 맞게 수정
import { redirect } from "next/navigation";

const ALLOWED_STATUSES = ["HOLD", "CONFIRMED", "CANCELLED"] as const;
type ReservationStatus = (typeof ALLOWED_STATUSES)[number];

export async function updateReservationStatus(formData: FormData) {
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as ReservationStatus;

  if (!id) {
    throw new Error("잘못된 요청입니다. (id 없음)");
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    throw new Error("허용되지 않은 상태 값입니다.");
  }

  await prisma.reservation.update({
    where: { id },
    data: { status },
  });

  // 상태 변경 후 다시 목록으로
  redirect("/admin/reservations");
}
