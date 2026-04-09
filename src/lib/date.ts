/**
 * 타임존 안전한 날짜 유틸리티
 *
 * 예약 시스템에서 날짜는 "date-only" 개념이다.
 * 클라이언트 타임존과 무관하게 항상 YYYY-MM-DD 문자열로 주고받고,
 * 서버에서는 UTC 자정으로 정규화하여 저장한다.
 */

/** Date 객체에서 로컬 타임존 기준 YYYY-MM-DD 문자열 추출 (클라이언트용) */
export function toDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Date 객체에서 UTC 기준 YYYY-MM-DD 문자열 추출 (서버용: DB의 UTC 날짜 직렬화) */
export function toDateOnlyUTC(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** YYYY-MM-DD 문자열을 UTC 자정 Date로 변환 */
export function parseUTCDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Date 객체를 한국어 날짜 문자열로 포맷 (서버/클라이언트 TZ 무관) */
export function formatDateKR(date: Date): string {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  return `${y}. ${m}. ${d}.`;
}
