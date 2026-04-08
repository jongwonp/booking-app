"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { overlapWhere } from "@/lib/overlap";
import { calcTotal } from "@/lib/pricing";

export async function confirmReservationAction(id: string) {
  const session = await auth();

  await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({
      where: { id },
    });

    if (!reservation || reservation.userId !== session?.user?.id) {
      throw new Error("권한이 없습니다.");
    }

    // HOLD 상태가 아니거나 만료된 경우 거부
    if (
      reservation.status !== "HOLD" ||
      (reservation.holdExpiresAt && reservation.holdExpiresAt < new Date())
    ) {
      throw new Error("확정할 수 없는 예약입니다. (만료되었거나 이미 처리됨)");
    }

    // 겹치는 예약 재검증
    const overlap = await tx.reservation.findFirst({
      where: overlapWhere(
        reservation.listingId,
        reservation.checkIn,
        reservation.checkOut,
        reservation.id,
      ),
    });
    if (overlap) {
      throw new Error("해당 날짜에 이미 다른 예약이 확정되어 있습니다.");
    }

    // totalPrice 보정 (0이면 재계산)
    let total = reservation.totalPrice;
    if (!total) {
      const listing = await tx.listing.findUnique({
        where: { id: reservation.listingId },
        select: { nightlyPrice: true },
      });
      if (!listing) throw new Error("숙소를 찾을 수 없습니다.");
      total = calcTotal(listing.nightlyPrice, reservation.checkIn, reservation.checkOut);
    }

    await tx.reservation.update({
      where: { id },
      data: { status: "CONFIRMED", totalPrice: total },
    });
  }, { isolationLevel: "Serializable" });

  revalidatePath(`/reservations/${id}`);
}

export async function cancelReservationAction(id: string) {
  const session = await auth();
  const reservation = await prisma.reservation.findUnique({ where: { id } });

  if (!reservation || reservation.userId !== session?.user?.id) {
    throw new Error("권한이 없습니다.");
  }

  if (reservation.status === "CANCELLED") {
    throw new Error("이미 취소된 예약입니다.");
  }

  await prisma.reservation.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  revalidatePath(`/reservations/${id}`);
}
