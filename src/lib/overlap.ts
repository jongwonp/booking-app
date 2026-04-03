import { Prisma } from "@prisma/client";
export const overlapWhere = (listingId: string, inAt: Date, outAt: Date, excludeId?: string): Prisma.ReservationWhereInput => ({
  listingId,
  status: { in: ["HOLD", "CONFIRMED"] },
  id: excludeId ? { not: excludeId } : undefined,
  NOT: [
    { checkOut: { lte: inAt } }, // oldOut <= newIn
    { checkIn: { gte: outAt } }, // oldIn >= newOut
  ],
});
