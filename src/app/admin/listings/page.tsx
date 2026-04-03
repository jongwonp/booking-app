import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteListing } from "./actions";
import  Button  from "@/components/ui/Button";
export default async function AdminListingsPage() {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" }, // createdAt 없으면 이 줄은 빼도 됨
  });

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">숙소 관리</h2>
        <Link
          href="/admin/listings/new"
          className="rounded bg-black px-4 py-2 text-sm text-white"
        >
          새 숙소 만들기
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-2xl border bg-white px-6 py-8 text-center">
      <p className="text-sm text-slate-600">
        등록된 숙소가 아직 없습니다.
      </p>
      <Link
        href="/admin/listings/new"
        className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        첫 숙소 등록하기
      </Link>
    </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">제목</th>
                <th className="px-4 py-2 text-right">1박 가격</th>
                <th className="px-4 py-2 text-right">최대 인원</th>
                <th className="px-4 py-2 text-center">상태</th>
                <th className="px-4 py-2 text-center">액션</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} className="border-t">
                  <td className="px-4 py-2">
                    <div className="font-medium">{listing.title}</div>
                    <div className="text-xs text-gray-500">{listing.id}</div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    {listing.nightlyPrice?.toLocaleString() ?? "-"}원
                  </td>
                  <td className="px-4 py-2 text-right">
                    {listing.maxGuests ?? "-"}명
                  </td>
                  <td className="px-4 py-2 text-center">
                    {/* isActive 필드 있다고 가정, 없으면 항상 "활성"으로 두고 나중에 보강 */}
                    {"isActive" in listing
                      ? (listing as any).isActive
                        ? "활성"
                        : "숨김"
                      : "활성"}
                  </td>

                  <td className="px-4 py-2 text-center space-x-2">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                    >
                      보기
                    </Link>
                    <Link
                      href={`/admin/listings/${listing.id}/edit`}
                      className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                    >
                      수정
                    </Link>

                    <form action={deleteListing} className="inline">
                      <input type="hidden" name="id" value={listing.id} />
                      <Button type="submit">삭제</Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
