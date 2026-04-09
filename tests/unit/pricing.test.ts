import { describe, test, expect } from "vitest";
import { nightsBetween, calcTotal, calcTotalWithRules } from "@/lib/pricing";

// 테스트용 헬퍼: UTC 자정 Date 생성
const d = (s: string) => new Date(`${s}T00:00:00Z`);

describe("nightsBetween", () => {
  test("2박 (4/10 ~ 4/12)", () => {
    expect(nightsBetween(d("2026-04-10"), d("2026-04-12"))).toBe(2);
  });

  test("1박 (4/10 ~ 4/11)", () => {
    expect(nightsBetween(d("2026-04-10"), d("2026-04-11"))).toBe(1);
  });

  test("같은 날짜면 0박", () => {
    expect(nightsBetween(d("2026-04-10"), d("2026-04-10"))).toBe(0);
  });

  test("30박 장기 투숙", () => {
    expect(nightsBetween(d("2026-04-01"), d("2026-05-01"))).toBe(30);
  });

  test("월 경계를 넘는 경우 (4/28 ~ 5/3 = 5박)", () => {
    expect(nightsBetween(d("2026-04-28"), d("2026-05-03"))).toBe(5);
  });
});

describe("calcTotal", () => {
  test("기본 가격 × 박수", () => {
    expect(calcTotal(100_000, d("2026-04-10"), d("2026-04-12"))).toBe(200_000);
  });

  test("1박", () => {
    expect(calcTotal(80_000, d("2026-04-10"), d("2026-04-11"))).toBe(80_000);
  });
});

describe("calcTotalWithRules", () => {
  const nightly = 100_000;

  test("규칙이 없으면 기본 가격 적용", () => {
    const result = calcTotalWithRules(nightly, d("2026-04-10"), d("2026-04-12"), []);
    expect(result).toBe(200_000);
  });

  test("OVERRIDE: 특정 날짜에 고정 가격 적용", () => {
    // 4/10은 80,000원 고정, 4/11은 기본가 100,000원
    const rules = [
      { startDate: d("2026-04-10"), endDate: d("2026-04-11"), type: "OVERRIDE" as const, value: 80_000 },
    ];
    const result = calcTotalWithRules(nightly, d("2026-04-10"), d("2026-04-12"), rules);
    expect(result).toBe(180_000); // 80,000 + 100,000
  });

  test("PERCENT: 할인율 적용 (-20%)", () => {
    // 4/10~4/12 전체에 20% 할인
    const rules = [
      { startDate: d("2026-04-10"), endDate: d("2026-04-12"), type: "PERCENT" as const, value: -20 },
    ];
    const result = calcTotalWithRules(nightly, d("2026-04-10"), d("2026-04-12"), rules);
    expect(result).toBe(160_000); // 80,000 × 2
  });

  test("PERCENT: 할증율 적용 (+30%)", () => {
    const rules = [
      { startDate: d("2026-04-10"), endDate: d("2026-04-12"), type: "PERCENT" as const, value: 30 },
    ];
    const result = calcTotalWithRules(nightly, d("2026-04-10"), d("2026-04-12"), rules);
    expect(result).toBe(260_000); // 130,000 × 2
  });

  test("규칙이 일부 날짜에만 적용되는 경우", () => {
    // 3박 중 첫 날만 OVERRIDE 50,000원
    const rules = [
      { startDate: d("2026-04-10"), endDate: d("2026-04-11"), type: "OVERRIDE" as const, value: 50_000 },
    ];
    const result = calcTotalWithRules(nightly, d("2026-04-10"), d("2026-04-13"), rules);
    expect(result).toBe(250_000); // 50,000 + 100,000 + 100,000
  });

  test("여러 규칙이 각각 다른 날짜에 적용", () => {
    // 4/10: OVERRIDE 50,000 / 4/11: PERCENT +50% / 4/12: 기본가
    const rules = [
      { startDate: d("2026-04-10"), endDate: d("2026-04-11"), type: "OVERRIDE" as const, value: 50_000 },
      { startDate: d("2026-04-11"), endDate: d("2026-04-12"), type: "PERCENT" as const, value: 50 },
    ];
    const result = calcTotalWithRules(nightly, d("2026-04-10"), d("2026-04-13"), rules);
    expect(result).toBe(300_000); // 50,000 + 150,000 + 100,000
  });
});
