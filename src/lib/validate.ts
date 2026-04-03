// 간단 날짜/입력 검증 유틸 (추가 패키지 없음)

// YYYY-MM-DD 형식인지, 실제 달력상 유효한지 체크
export function isValidISODate(d: unknown): d is string {
  if (typeof d !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return false;
  // toISOString().slice(0,10)로 역직렬화 검증
  return date.toISOString().slice(0,10) === d;
}

// 규칙: checkIn >= today, checkOut > checkIn, 숙박 30일 이내
export function validateStay(checkIn: string, checkOut: string) {
  const today = new Date(); // now
  const ymd = (dt: Date) => dt.toISOString().slice(0,10);
  const todayStr = ymd(today);

  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diffMs = outDate.getTime() - inDate.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);

  const errors: string[] = [];
  if (!isValidISODate(checkIn)) errors.push("checkIn 형식이 잘못되었습니다(YYYY-MM-DD).");
  if (!isValidISODate(checkOut)) errors.push("checkOut 형식이 잘못되었습니다(YYYY-MM-DD).");
  if (isValidISODate(checkIn) && checkIn < todayStr) errors.push("체크인은 오늘 이후여야 합니다.");
  if (isValidISODate(checkIn) && isValidISODate(checkOut) && !(checkOut > checkIn)) {
    errors.push("체크아웃은 체크인보다 늦어야 합니다.");
  }
  if (isValidISODate(checkIn) && isValidISODate(checkOut) && diffDays > 30) {
    errors.push("최대 숙박 기간은 30일입니다.");
  }

  return { ok: errors.length === 0, errors, diffDays };
}
