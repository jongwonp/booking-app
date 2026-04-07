"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function confirmReservationAction(id: string) {
  const session = await auth();
  const reservation = await prisma.reservation.findUnique({ where: { id } });

  if (!reservation || reservation.userId !== session?.user?.id) {
    throw new Error("권한이 없습니다.");
  }

  await prisma.reservation.update({
    where: { id },
    data: { status: "CONFIRMED" },
  });

  revalidatePath(`/reservations/${id}`);
}

export async function cancelReservationAction(id: string) {
  const session = await auth();
  const reservation = await prisma.reservation.findUnique({ where: { id } });

  if (!reservation || reservation.userId !== session?.user?.id) {
    throw new Error("권한이 없습니다.");
  }

  await prisma.reservation.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  revalidatePath(`/reservations/${id}`);
}
