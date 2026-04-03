import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const listings = [
    {
      id: "l_001",
      title: "서울 리버사이드 룸",
      description: "한강이 보이는 아늑한 룸입니다.",
      nightlyPrice: 89000,
      location: "Seoul",
      maxGuests: 2,
      imageUrls: ["https://picsum.photos/seed/seoul/800/500"],
    },
    {
      id: "l_002",
      title: "부산 오션뷰 스튜디오",
      description: "바다가 한눈에 보이는 스튜디오입니다.",
      nightlyPrice: 109000,
      location: "Busan",
      maxGuests: 2,
      imageUrls: ["https://picsum.photos/seed/busan/800/500"],
    },
  ];

  for (const listing of listings) {
    await prisma.listing.upsert({
      where: { id: listing.id },
      create: listing,
      update: listing,
    });
    console.log(`Upserted listing: ${listing.title}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
