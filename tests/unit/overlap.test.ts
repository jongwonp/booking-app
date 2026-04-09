import { describe, test, expect } from "vitest";
import { overlapWhere, calendarBlockOverlapWhere } from "@/lib/overlap";

const d = (s: string) => new Date(`${s}T00:00:00Z`);
const LISTING = "listing-1";

describe("overlapWhere", () => {
  test("기본 필터 구조가 올바르다", () => {
    const where = overlapWhere(LISTING, d("2026-04-10"), d("2026-04-12"));
    expect(where.listingId).toBe(LISTING);
    expect(where.status).toEqual({ in: ["HOLD", "CONFIRMED"] });
    expect(where.NOT).toEqual([
      { checkOut: { lte: d("2026-04-10") } },
      { checkIn: { gte: d("2026-04-12") } },
    ]);
  });

  test("excludeId가 없으면 id 필터가 undefined", () => {
    const where = overlapWhere(LISTING, d("2026-04-10"), d("2026-04-12"));
    expect(where.id).toBeUndefined();
  });

  test("excludeId가 있으면 해당 ID를 제외한다", () => {
    const where = overlapWhere(LISTING, d("2026-04-10"), d("2026-04-12"), "res-99");
    expect(where.id).toEqual({ not: "res-99" });
  });

  test("CANCELLED 상태는 제외된다 (HOLD, CONFIRMED만 조회)", () => {
    const where = overlapWhere(LISTING, d("2026-04-10"), d("2026-04-12"));
    const statusFilter = where.status as { in: string[] };
    expect(statusFilter.in).not.toContain("CANCELLED");
  });
});

describe("calendarBlockOverlapWhere", () => {
  test("기본 필터 구조가 올바르다", () => {
    const where = calendarBlockOverlapWhere(LISTING, d("2026-04-10"), d("2026-04-12"));
    expect(where.listingId).toBe(LISTING);
    expect(where.NOT).toEqual([
      { endDate: { lte: d("2026-04-10") } },
      { startDate: { gte: d("2026-04-12") } },
    ]);
  });
});

/**
 * 겹침 감지 로직 설명:
 *
 * NOT [ oldOut <= newIn, oldIn >= newOut ]
 *
 * 이는 "겹치지 않는 조건의 부정"이다.
 * 겹치지 않으려면: 기존 예약이 새 예약 앞에 완전히 끝나거나(oldOut <= newIn),
 *                  기존 예약이 새 예약 뒤에 완전히 시작(oldIn >= newOut)해야 한다.
 * 이 두 조건이 모두 해당하지 않으면 → 겹친다.
 *
 * 예시 (newIn=4/10, newOut=4/12):
 * - 기존 4/8~4/10: oldOut(4/10) <= newIn(4/10) → 겹치지 않음 ✅
 * - 기존 4/12~4/14: oldIn(4/12) >= newOut(4/12) → 겹치지 않음 ✅
 * - 기존 4/9~4/11: 두 조건 모두 불만족 → 겹침 ❌
 * - 기존 4/10~4/12: 두 조건 모두 불만족 → 겹침 ❌
 * - 기존 4/11~4/13: 두 조건 모두 불만족 → 겹침 ❌
 */
