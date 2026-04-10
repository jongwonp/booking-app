// src/lib/validators.ts
import { z } from "zod";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DateOrISO = z.string().refine(
  (v) => DATE_ONLY.test(v) || !isNaN(new Date(v).getTime()),
  { message: "YYYY-MM-DD 또는 ISO 8601 형식이어야 합니다." },
);

export const CreateReservation = z.object({
  listingId: z.string().min(1),
  checkIn: DateOrISO,
  checkOut: DateOrISO,
  guests: z.number().int().min(1, "1명 이상이어야 합니다."),
}).refine(v => new Date(v.checkOut) > new Date(v.checkIn), { message: "invalid range" })
  .refine(v => (new Date(v.checkOut).getTime() - new Date(v.checkIn).getTime()) >= 86_400_000, { message: "min 1 night" });

// --- Admin schemas ---

const dateStr = z.string().min(1, "날짜를 입력해주세요.").refine(
  (v) => !isNaN(Date.parse(v)),
  { message: "올바른 날짜 형식이 아닙니다." },
);

export const ListingForm = z.object({
  title: z.string().min(1, "제목을 입력해주세요.").max(200),
  location: z.string().min(1, "지역을 입력해주세요.").max(100),
  description: z.string().max(2000).optional(),
  nightlyPrice: z.number().int().min(1, "1박 가격은 1원 이상이어야 합니다."),
  maxGuests: z.number().int().min(1, "최대 인원은 1명 이상이어야 합니다."),
  isActive: z.boolean(),
});

export const CalendarBlockForm = z.object({
  listingId: z.string().min(1),
  startDate: dateStr,
  endDate: dateStr,
  reason: z.string().max(200).optional(),
}).refine(
  (v) => new Date(v.endDate) > new Date(v.startDate),
  { message: "종료일은 시작일 이후여야 합니다." },
);

export const PriceRuleForm = z.object({
  listingId: z.string().min(1),
  startDate: dateStr,
  endDate: dateStr,
  type: z.enum(["OVERRIDE", "PERCENT"]),
  value: z.number().int().refine((v) => v !== 0, { message: "값은 0이 아니어야 합니다." }),
  label: z.string().max(100).optional(),
}).refine(
  (v) => new Date(v.endDate) > new Date(v.startDate),
  { message: "종료일은 시작일 이후여야 합니다." },
);

export const UpdateReservationStatus = z.object({
  id: z.string().min(1),
  status: z.enum(["HOLD", "CONFIRMED", "CANCELLED"]),
});

// FormData → plain object 헬퍼
export function formStr(fd: FormData, key: string): string {
  return String(fd.get(key) || "").trim();
}
export function formNum(fd: FormData, key: string): number {
  return Number(fd.get(key)) || 0;
}
export function formBool(fd: FormData, key: string): boolean {
  return fd.get(key) === "on";
}
