import { prisma } from "@/lib/prisma";
import { updateListing } from "../../actions";
import Button from "@/components/ui/Button";
type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage(props: Props) {
  const { id } = await props.params;
  const listing = await prisma.listing.findUnique({
    where: { id },
  });

  if (!listing) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <h1 className="text-xl font-semibold">숙소를 찾을 수 없습니다</h1>
        <p className="mt-2 text-sm text-slate-600">
          링크가 잘못되었거나, 숙소가 삭제되었을 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <header className="space-y-1 border-b pb-4">
        <h1 className="text-xl font-semibold">숙소 수정</h1>
        <p className="text-sm text-slate-600">{listing.title}</p>
      </header>

      <form action={updateListing} className="space-y-4 max-w-xl">
        {/* hidden id */}
        <input type="hidden" name="id" value={listing.id} />

        <div>
          <label className="block text-sm font-medium mb-1">
            제목<span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            type="text"
            required
            defaultValue={listing.title}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            지역<span className="text-red-500">*</span>
          </label>
          <input
            name="location"
            type="text"
            required
            defaultValue={listing.location}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">소개글</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={listing.description ?? ""}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              1박 가격(원)<span className="text-red-500">*</span>
            </label>
            <input
              name="nightlyPrice"
              type="number"
              min={1}
              step={1}
              required
              defaultValue={Number(listing.nightlyPrice ?? 0)}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              최대 인원(명)<span className="text-red-500">*</span>
            </label>
            <input
              name="maxGuests"
              type="number"
              min={1}
              step={1}
              required
              defaultValue={Number(listing.maxGuests ?? 1)}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">이미지 URL</label>
          <textarea
            name="imageUrls"
            rows={3}
            defaultValue={listing.imageUrls?.join("\n") ?? ""}
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder={"한 줄에 하나씩 이미지 URL을 입력하세요."}
          />
          <p className="mt-1 text-xs text-slate-500">
            여러 장은 줄바꿈으로 구분합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            defaultChecked={
              "isActive" in listing ? (listing as any).isActive : true
            }
            className="h-4 w-4"
          />
          <label htmlFor="isActive" className="text-sm">
            리스트에 공개 (활성)
          </label>
        </div>

        <div className="flex gap-2">
          <Button type="submit">수정 완료</Button>
        </div>
      </form>
    </div>
  );
}
