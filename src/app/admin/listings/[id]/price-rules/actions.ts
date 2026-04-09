"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/admin";
import { PriceRuleForm, formStr, formNum } from "@/lib/validators";

export async function createPriceRule(formData: FormData) {
  await assertAdmin();

  const parsed = PriceRuleForm.parse({
    listingId: formStr(formData, "listingId"),
    startDate: formStr(formData, "startDate"),
    endDate: formStr(formData, "endDate"),
    type: formStr(formData, "type") || "OVERRIDE",
    value: formNum(formData, "value"),
    label: formStr(formData, "label") || undefined,
  });

  await prisma.priceRule.create({
    data: {
      listingId: parsed.listingId,
      startDate: new Date(parsed.startDate),
      endDate: new Date(parsed.endDate),
      type: parsed.type,
      value: parsed.value,
      label: parsed.label || null,
    },
  });

  redirect(`/admin/listings/${parsed.listingId}/price-rules`);
}

export async function deletePriceRule(formData: FormData) {
  await assertAdmin();
  const id = formStr(formData, "id");
  const listingId = formStr(formData, "listingId");
  if (!id) throw new Error("잘못된 요청입니다.");

  await prisma.priceRule.delete({ where: { id } });

  redirect(`/admin/listings/${listingId}/price-rules`);
}
