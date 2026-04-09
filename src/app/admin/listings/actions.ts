"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/admin";
import { ListingForm, formStr, formNum, formBool } from "@/lib/validators";

export async function createListing(formData: FormData) {
  await assertAdmin();

  const parsed = ListingForm.parse({
    title: formStr(formData, "title"),
    location: formStr(formData, "location"),
    description: formStr(formData, "description") || undefined,
    nightlyPrice: formNum(formData, "nightlyPrice"),
    maxGuests: formNum(formData, "maxGuests"),
    isActive: formBool(formData, "isActive"),
  });

  await prisma.listing.create({ data: parsed });

  redirect("/admin/listings");
}

export async function updateListing(formData: FormData) {
  await assertAdmin();
  const id = formStr(formData, "id");
  if (!id) throw new Error("잘못된 요청입니다. (id 없음)");

  const parsed = ListingForm.parse({
    title: formStr(formData, "title"),
    location: formStr(formData, "location"),
    description: formStr(formData, "description") || undefined,
    nightlyPrice: formNum(formData, "nightlyPrice"),
    maxGuests: formNum(formData, "maxGuests"),
    isActive: formBool(formData, "isActive"),
  });

  await prisma.listing.update({ where: { id }, data: parsed });

  redirect("/admin/listings");
}

export async function deleteListing(formData: FormData) {
  await assertAdmin();
  const id = formStr(formData, "id");
  if (!id) throw new Error("잘못된 요청입니다. (id 없음)");

  await prisma.listing.delete({ where: { id } });

  redirect("/admin/listings");
}
