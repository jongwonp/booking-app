export type Listing = {
  id: string;
  slug: string;
  title: string;
  nightlyPrice: number;
  location: string;
  image: string;
};

export type Reservation = {
  id: string;
  listingId: string;
  status: "HOLD" | "CONFIRMED";
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  createdAt: number; // epoch(ms)
};

// 하드코딩 샘플 숙소
export const listings: Listing[] = [
  {
    id: "l_001",
    slug: "seoul-riverside-room",
    title: "서울 리버사이드 룸",
    nightlyPrice: 89000,
    location: "Seoul",
    image: "https://picsum.photos/seed/seoul/800/500",
  },
  {
    id: "l_002",
    slug: "busan-ocean-view",
    title: "부산 오션뷰 스튜디오",
    nightlyPrice: 109000,
    location: "Busan",
    image: "https://picsum.photos/seed/busan/800/500",
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __memory__reservations: Map<string, Reservation> | undefined;
}
const rsvStore =
  globalThis.__memory__reservations ?? new Map<string, Reservation>();
globalThis.__memory__reservations = rsvStore;

export const memoryDB = {
  reservations: rsvStore,
};

export function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}
