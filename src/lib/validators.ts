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
  nightlyPrice: z
    .number({ error: "1박 가격을 숫자로 입력해주세요." })
    .int()
    .min(1, "1박 가격은 1원 이상이어야 합니다."),
  maxGuests: z
    .number({ error: "최대 인원을 숫자로 입력해주세요." })
    .int()
    .min(1, "최대 인원은 1명 이상이어야 합니다."),
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
  value: z
    .number({ error: "값을 숫자로 입력해주세요." })
    .int()
    .refine((v) => v !== 0, { message: "값은 0이 아니어야 합니다." }),
  label: z.string().max(100).optional(),
}).refine(
  (v) => new Date(v.endDate) > new Date(v.startDate),
  { message: "종료일은 시작일 이후여야 합니다." },
);

// FormData → plain object 헬퍼
export function formStr(fd: FormData, key: string): string {
  return String(fd.get(key) || "").trim();
}
/**
 * FormData의 숫자 필드를 파싱한다.
 *
 * 빈 값 / 숫자로 파싱 불가한 경우 NaN을 반환해서, 뒤의 Zod 스키마가
 * "숫자가 아닙니다" 메시지로 거르도록 한다. 이전 구현(`|| 0`)은 빈 값,
 * 잘못된 입력, 실제 0을 모두 0으로 뭉뚱그려서 오류 원인을 감춰버렸다.
 */
export function formNum(fd: FormData, key: string): number {
  const raw = fd.get(key);
  if (raw === null || raw === "") return NaN;
  const n = Number(raw);
  return Number.isFinite(n) ? n : NaN;
}
export function formBool(fd: FormData, key: string): boolean {
  return fd.get(key) === "on";
}
