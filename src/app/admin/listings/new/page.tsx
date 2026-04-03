import { createListing } from "../actions";
import Button from "@/components/ui/Button";
export default function AdminNewListingPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <header className="space-y-1 border-b pb-4">
        <h1 className="text-xl font-semibold">새 숙소 등록</h1>
        <p className="text-sm text-slate-600">
          제목, 위치, 1박 요금 등 기본 정보를 입력하고 숙소를 등록하세요.
        </p>
      </header>

      <form action={createListing} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium mb-1">
            제목<span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            type="text"
            required
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="예: 서울 시티뷰 원룸"
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
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="예: 서울"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">소개글</label>
          <textarea
            name="description"
            rows={4}
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="숙소에 대한 간단한 설명을 적어주세요."
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
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            defaultChecked
            className="h-4 w-4"
          />
          <label htmlFor="isActive" className="text-sm">
            리스트에 공개 (활성)
          </label>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            className="rounded bg-black px-4 py-2 text-sm text-white"
          >
            저장하기
          </Button>
        </div>
      </form>
    </div>
  );
}
