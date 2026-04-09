import { describe, test, expect } from "vitest";
import { toDateOnly, toDateOnlyUTC, parseUTCDate, formatDateKR } from "@/lib/date";

describe("parseUTCDate", () => {
  test("YYYY-MM-DD를 UTC 자정으로 변환", () => {
    const date = parseUTCDate("2026-04-10");
    expect(date.getUTCFullYear()).toBe(2026);
    expect(date.getUTCMonth()).toBe(3); // 0-indexed
    expect(date.getUTCDate()).toBe(10);
    expect(date.getUTCHours()).toBe(0);
    expect(date.getUTCMinutes()).toBe(0);
  });

  test("1월 1일 경계", () => {
    const date = parseUTCDate("2026-01-01");
    expect(date.getUTCMonth()).toBe(0);
    expect(date.getUTCDate()).toBe(1);
  });

  test("12월 31일 경계", () => {
    const date = parseUTCDate("2026-12-31");
    expect(date.getUTCMonth()).toBe(11);
    expect(date.getUTCDate()).toBe(31);
  });
});

describe("toDateOnlyUTC", () => {
  test("UTC 자정 Date에서 YYYY-MM-DD 추출", () => {
    const date = new Date("2026-04-10T00:00:00Z");
    expect(toDateOnlyUTC(date)).toBe("2026-04-10");
  });

  test("한 자리 월/일에 0을 채운다", () => {
    const date = new Date("2026-01-05T00:00:00Z");
    expect(toDateOnlyUTC(date)).toBe("2026-01-05");
  });

  test("parseUTCDate와 역변환이 성립", () => {
    const original = "2026-07-15";
    expect(toDateOnlyUTC(parseUTCDate(original))).toBe(original);
  });
});

describe("toDateOnly (로컬 타임존 기반)", () => {
  test("로컬 Date에서 YYYY-MM-DD 추출", () => {
    // 로컬 자정으로 생성
    const date = new Date(2026, 3, 10); // 4월 10일 (month는 0-indexed)
    expect(toDateOnly(date)).toBe("2026-04-10");
  });
});

describe("formatDateKR", () => {
  test("한국어 날짜 포맷", () => {
    const date = new Date("2026-04-10T00:00:00Z");
    expect(formatDateKR(date)).toBe("2026. 4. 10.");
  });

  test("한 자리 월/일에 0을 붙이지 않는다", () => {
    const date = new Date("2026-01-05T00:00:00Z");
    expect(formatDateKR(date)).toBe("2026. 1. 5.");
  });
});
