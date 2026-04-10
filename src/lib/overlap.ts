import { Prisma } from "@prisma/client";

/**
 * 새 예약 범위와 겹치는 기존 예약을 찾기 위한 where 조건.
 *
 * 차단 대상:
 *  - CONFIRMED 예약 (항상)
 *  - HOLD 예약 중 아직 만료되지 않은 것 (holdExpiresAt > now)
 *
 * 만료된 HOLD는 cron이 정리하기 전에도 즉시 가용 처리한다.
 * 이렇게 하면 cron이 잠시 지연되거나 실패해도 새 예약이 불필요하게 막히지 않는다.
 *
 * @param now 현재 시각. 테스트에서 시간 고정용으로 주입 가능. 기본값 new Date()
 */
export const overlapWhere = (
  listingId: string,
  inAt: Date,
  outAt: Date,
  excludeId?: string,
  now: Date = new Date(),
): Prisma.ReservationWhereInput => ({
  listingId,
  id: excludeId ? { not: excludeId } : undefined,
  OR: [
    { status: "CONFIRMED" },
    { status: "HOLD", holdExpiresAt: { gt: now } },
  ],
  NOT: [
    { checkOut: { lte: inAt } }, // oldOut <= newIn
    { checkIn: { gte: outAt } }, // oldIn >= newOut
  ],
});

export const calendarBlockOverlapWhere = (listingId: string, inAt: Date, outAt: Date): Prisma.CalendarBlockWhereInput => ({
  listingId,
  NOT: [
    { endDate: { lte: inAt } },
    { startDate: { gte: outAt } },
  ],
});
