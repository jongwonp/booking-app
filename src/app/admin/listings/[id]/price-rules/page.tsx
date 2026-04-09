import { prisma } from "@/lib/prisma";
import { formatDateKR } from "@/lib/date";
import { createPriceRule, deletePriceRule } from "./actions";
import Button from "@/components/ui/Button";
import Link from "next/link";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PriceRulesPage(props: Props) {
  const { id } = await props.params;

  const [listing, rules] = await Promise.all([
    prisma.listing.findUnique({
      where: { id },
      select: { id: true, title: true, nightlyPrice: true },
    }),
    prisma.priceRule.findMany({
      where: { listingId: id },
      orderBy: { startDate: "asc" },
    }),
  ]);

  if (!listing) {
    return (
      <div className="px-4 py-10">
        <h1 className="text-xl font-semibold">숙소를 찾을 수 없습니다</h1>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <header className="space-y-1 border-b pb-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/admin/listings" className="hover:underline">숙소 관리</Link>
          <span>/</span>
          <Link href={`/admin/listings/${id}/edit`} className="hover:underline">{listing.title}</Link>
          <span>/</span>
          <span>가격 규칙</span>
        </div>
        <h1 className="text-xl font-semibold">가격 규칙 관리</h1>
        <p className="text-sm text-slate-600">
          기본 1박 가격: ₩{listing.nightlyPrice.toLocaleString()} — 특정 기간에 다른 가격을 적용할 수 있습니다.
        </p>
      </header>

      {/* 새 규칙 추가 폼 */}
      <form action={createPriceRule} className="space-y-3 rounded-xl border bg-white p-4">
        <h2 className="text-sm font-semibold">새 가격 규칙 추가</h2>
        <input type="hidden" name="listingId" value={id} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">시작일</label>
            <input
              name="startDate"
              type="date"
              required
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">종료일</label>
            <input
              name="endDate"
              type="date"
              required
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">유형</label>
            <select
              name="type"
              className="w-full rounded border px-3 py-2 text-sm"
            >
              <option value="OVERRIDE">고정 가격 (원/박)</option>
              <option value="PERCENT">할인/할증 (%)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">값</label>
            <input
              name="value"
              type="number"
              required
              placeholder="예: 150000 또는 -20"
              className="w-full rounded border px-3 py-2 text-sm"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">
              고정 가격: 원 단위 / 할인·할증: -20은 20% 할인, +30은 30% 할증
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">라벨 (선택)</label>
          <input
            name="label"
            type="text"
            placeholder="예: 성수기, 연말 할인"
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>

        <Button type="submit">규칙 추가</Button>
      </form>

      {/* 기존 규칙 목록 */}
      {rules.length === 0 ? (
        <div className="rounded-xl border bg-white px-6 py-8 text-center text-sm text-slate-500">
          등록된 가격 규칙이 없습니다. 기본 가격이 적용됩니다.
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between rounded-xl border bg-white px-4 py-3"
            >
              <div>
                <div className="text-sm font-medium">
                  {formatDateKR(rule.startDate)} ~ {formatDateKR(rule.endDate)}
                  {rule.label && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                      {rule.label}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  {rule.type === "OVERRIDE"
                    ? `고정 ₩${rule.value.toLocaleString()}/박`
                    : `${rule.value > 0 ? "+" : ""}${rule.value}%`}
                </div>
              </div>
              <form action={deletePriceRule}>
                <input type="hidden" name="id" value={rule.id} />
                <input type="hidden" name="listingId" value={id} />
                <Button type="submit" variant="ghost">삭제</Button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
