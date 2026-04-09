"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/admin";
import { UpdateReservationStatus, formStr } from "@/lib/validators";

export async function updateReservationStatus(formData: FormData) {
  await assertAdmin();

  const parsed = UpdateReservationStatus.parse({
    id: formStr(formData, "id"),
    status: formStr(formData, "status"),
  });

  await prisma.reservation.update({
    where: { id: parsed.id },
    data: { status: parsed.status },
  });

  redirect("/admin/reservations");
}
