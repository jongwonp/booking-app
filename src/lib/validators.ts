// src/lib/validators.ts
import { z } from "zod";

const ISO = z.string().datetime({ offset: true });

export const CreateReservation = z.object({
  listingId: z.string().min(1),
  userId: z.string().min(1),
  checkIn: ISO,
  checkOut: ISO,
}).refine(v => new Date(v.checkOut) > new Date(v.checkIn), { message: "invalid range" })
  .refine(v => (new Date(v.checkOut).getTime() - new Date(v.checkIn).getTime()) >= 86_400_000, { message: "min 1 night" });
