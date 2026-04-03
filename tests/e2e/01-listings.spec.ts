import { test, expect } from "@playwright/test";

test("목록이 보이고 카드가 1개 이상 존재한다", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("listing-card").first()).toBeVisible();
  const count = await page.getByTestId("listing-card").count();
  expect(count).toBeGreaterThan(0);
});
