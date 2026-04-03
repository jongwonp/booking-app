import { z } from "zod";

// YYYY-MM-DD 형식 체크
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/,"YYYY-MM-DD 형식이어야 합니다.");

// 문자열 정규화(트림/유니코드)
const normalized = z.preprocess((v) => {
  if (typeof v === "string") return v.normalize().trim();
  if (v == null) return "";
  return String(v);
}, z.string().min(1, "필수 값입니다."));

const ymd = (d: Date) => d.toISOString().slice(0,10);

/**
 * 예약 생성 입력 파서
 * - listingId 정규화 및 존재 여부 검사(availableIds)
 * - checkIn/Out 기본값: 오늘 / 내일
 * - 규칙: checkIn >= 오늘, checkOut > checkIn, 최대 30일
 */
export function parseReservationCreate(
  input: unknown,
  availableIds: string[],
  now: Date = new Date()
) {
  const today = ymd(now);
  const tomorrow = ymd(new Date(now.getTime() + 86400000));

  const Base = z.object({
    listingId: normalized,
    checkIn: isoDate.optional(),
    checkOut: isoDate.optional(),
  })
  .transform((v) => ({
    listingId: v.listingId,
    checkIn: v.checkIn ?? today,
    checkOut: v.checkOut ?? tomorrow,
  }))
  .superRefine((v, ctx) => {
    if (!availableIds.includes(v.listingId)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["listingId"], message: "존재하지 않는 숙소입니다." });
    }
    if (!(v.checkIn >= today)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["checkIn"], message: "체크인은 오늘 이후여야 합니다." });
    }
    if (!(v.checkOut > v.checkIn)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["checkOut"], message: "체크아웃은 체크인보다 늦어야 합니다." });
    }
    const diffDays = Math.ceil(
      (new Date(v.checkOut).getTime() - new Date(v.checkIn).getTime()) / 86400000
    );
    if (diffDays > 30) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["checkOut"], message: "최대 숙박 기간은 30일입니다." });
    }
  });

  return Base.safeParse(input);
}

// 서버에서 parse 후 최종 사용되는 형태(기본값 적용된 결과)
export type ReservationCreateDTO = {
  listingId: string;
  checkIn: string;  // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
};

