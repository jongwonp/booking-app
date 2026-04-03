export const nightsBetween = (a: Date, b: Date) =>
  Math.ceil((b.getTime() - a.getTime()) / 86_400_000);

export const calcTotal = (nightly: number, checkIn: Date, checkOut: Date) =>
  nightsBetween(checkIn, checkOut) * nightly;
