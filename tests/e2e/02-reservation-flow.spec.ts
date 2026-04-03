import { test, expect } from "@playwright/test";

function fmt(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

test("상세에서 예약 생성 후 확정까지 완료된다", async ({ page }) => {
  // 1) 목록 → 상세 진입
  await page.goto("/listings");
  await page.locator('[data-testid^="listing-link-"]').first().click();
  await expect(page).toHaveURL(/\/listings\/.+$/);

  // 2) 날짜 입력 (오늘~내일)
  const checkIn = new Date(Date.now() + 10 * 86400000);
  const checkOut = new Date(Date.now() + 11 * 86400000);
  await page.getByTestId("checkin").fill(fmt(checkIn));
  await page.getByTestId("checkout").fill(fmt(checkOut));

  // 3) 예약 생성 (HOLD)
  await page.getByTestId("reserve").click();

  // ❌ 기존: 예약 상세 페이지로 이동 기대
  // await expect(page).toHaveURL(/\/reservations\/rsv_/);

  // ✅ 위젯 안 상태 확인
  await expect(page.getByTestId("status")).toHaveText("HOLD");

  // 4) 확정(PATCH)
  await page.getByTestId("confirm").click();
  await expect(page.getByTestId("status")).toHaveText("CONFIRMED");
});
