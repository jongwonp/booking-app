import type { PriceRuleType } from "@prisma/client";

export const nightsBetween = (a: Date, b: Date) =>
  Math.ceil((b.getTime() - a.getTime()) / 86_400_000);

export const calcTotal = (nightly: number, checkIn: Date, checkOut: Date) =>
  nightsBetween(checkIn, checkOut) * nightly;

type PriceRuleInput = {
  startDate: Date;
  endDate: Date;
  type: PriceRuleType;
  value: number;
};

export function calcTotalWithRules(
  nightly: number,
  checkIn: Date,
  checkOut: Date,
  rules: PriceRuleInput[],
): number {
  let total = 0;
  const cursor = new Date(checkIn);

  while (cursor < checkOut) {
    const rule = rules.find(
      (r) => cursor >= r.startDate && cursor < r.endDate,
    );

    if (rule) {
      if (rule.type === "OVERRIDE") {
        total += rule.value;
      } else {
        total += Math.round(nightly * (1 + rule.value / 100));
      }
    } else {
      total += nightly;
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return total;
}
