// src/lib/data.ts
export type Listing = {
  id: string;
  slug: string;
  title: string;
  nightlyPrice: number;
  location: string;
  image: string;
};

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
