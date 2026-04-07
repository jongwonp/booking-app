"use server";

import { prisma } from "@/lib/prisma"; // 네 프로젝트 경로에 맞게
import { redirect } from "next/navigation";

export async function createListing(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const nightlyPrice = Number(formData.get("nightlyPrice") || 0);
  const maxGuests = Number(formData.get("maxGuests") || 0);
  const isActive = formData.get("isActive") === "on";

  // 아주 간단한 서버쪽 검증 (라이트 버전)
  if (!title || nightlyPrice <= 0 || maxGuests <= 0) {
    // 진짜 서비스라면 에러 상태를 UI로 돌려주겠지만,
    // 지금은 그냥 throw로 막아도 충분.
    throw new Error("필수 필드를 올바르게 입력해주세요.");
  }

  await prisma.listing.create({
    data: {
      title,
      location,
      description,
      nightlyPrice,
      maxGuests,
      isActive,
    },
  });

  redirect("/admin/listings");
}

export async function updateListing(formData: FormData) {
  const id = String(formData.get("id") || "");
  const location = String(formData.get("location") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const nightlyPrice = Number(formData.get("nightlyPrice") || 0);
  const maxGuests = Number(formData.get("maxGuests") || 0);
  const isActive = formData.get("isActive") === "on";

  if (!id) {
    throw new Error("잘못된 요청입니다. (id 없음)");
  }

  if (!title || nightlyPrice <= 0 || maxGuests <= 0) {
    throw new Error("필수 필드를 올바르게 입력해주세요.");
  }

  await prisma.listing.update({
    where: { id },
    data: {
      title,
      location,
      description,
      nightlyPrice,
      maxGuests,
      isActive,
    },
  });

  redirect("/admin/listings");
}

export async function deleteListing(formData: FormData) {
  const id = String(formData.get("id") || "");

  if (!id) {
    throw new Error("잘못된 요청입니다. (id 없음)");
  }

  await prisma.listing.delete({
    where: { id },
  });

  // 삭제 후 다시 목록으로
  redirect("/admin/listings");
}
