import { prisma } from "@/lib/prisma";
import { createCalendarBlock, deleteCalendarBlock } from "./actions";
import Button from "@/components/ui/Button";
import Link from "next/link";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CalendarBlocksPage(props: Props) {
  const { id } = await props.params;

  const [listing, blocks] = await Promise.all([
    prisma.listing.findUnique({ where: { id }, select: { id: true, title: true } }),
    prisma.calendarBlock.findMany({
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
          <span>날짜 차단</span>
        </div>
        <h1 className="text-xl font-semibold">날짜 차단 관리</h1>
        <p className="text-sm text-slate-600">
          특정 기간에 예약을 받지 않도록 차단할 수 있습니다.
        </p>
      </header>

      {/* 새 차단 추가 폼 */}
      <form action={createCalendarBlock} className="space-y-3 rounded-xl border bg-white p-4">
        <h2 className="text-sm font-semibold">새 차단 추가</h2>
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

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">사유 (선택)</label>
          <input
            name="reason"
            type="text"
            placeholder="예: 리모델링, 개인 사용"
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>

        <Button type="submit">차단 추가</Button>
      </form>

      {/* 기존 차단 목록 */}
      {blocks.length === 0 ? (
        <div className="rounded-xl border bg-white px-6 py-8 text-center text-sm text-slate-500">
          등록된 차단 일정이 없습니다.
        </div>
      ) : (
        <div className="space-y-2">
          {blocks.map((block) => (
            <div
              key={block.id}
              className="flex items-center justify-between rounded-xl border bg-white px-4 py-3"
            >
              <div>
                <div className="text-sm font-medium">
                  {block.startDate.toLocaleDateString("ko-KR")} ~ {block.endDate.toLocaleDateString("ko-KR")}
                </div>
                {block.reason && (
                  <div className="text-xs text-slate-500">{block.reason}</div>
                )}
              </div>
              <form action={deleteCalendarBlock}>
                <input type="hidden" name="id" value={block.id} />
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
