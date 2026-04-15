"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";

export default function ListingsFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const update = useCallback(
    (key: string, value: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const next = new URLSearchParams(params.toString());
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
        // 필터/정렬이 바뀌면 1페이지부터 다시 보여줘야 함
        next.delete("page");
        router.push(`/listings?${next.toString()}`);
      }, 300);
    },
    [params, router]
  );

  const reset = () => router.push("/listings");

  const hasFilter =
    params.has("location") || params.has("guests") || params.has("checkIn") || params.has("checkOut") || params.has("sort");

  return (
    <div className="flex flex-wrap gap-3 items-end rounded-xl border bg-white p-4">
      <div className="flex flex-col gap-1 min-w-[120px]">
        <label className="text-xs font-medium text-slate-500">정렬</label>
        <select
          defaultValue={params.get("sort") ?? "newest"}
          onChange={(e) => update("sort", e.target.value === "newest" ? "" : e.target.value)}
          className="rounded border px-3 py-1.5 text-sm bg-white"
        >
          <option value="newest">최신순</option>
          <option value="price-asc">가격 낮은순</option>
          <option value="price-desc">가격 높은순</option>
          <option value="guests-desc">인원 많은순</option>
        </select>
      </div>

      <div className="flex flex-col gap-1 min-w-[140px]">
        <label className="text-xs font-medium text-slate-500">지역</label>
        <input
          type="text"
          placeholder="예: 서울"
          defaultValue={params.get("location") ?? ""}
          onChange={(e) => update("location", e.target.value)}
          className="rounded border px-3 py-1.5 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">체크인</label>
        <input
          type="date"
          defaultValue={params.get("checkIn") ?? ""}
          onChange={(e) => update("checkIn", e.target.value)}
          className="rounded border px-3 py-1.5 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">체크아웃</label>
        <input
          type="date"
          defaultValue={params.get("checkOut") ?? ""}
          onChange={(e) => update("checkOut", e.target.value)}
          className="rounded border px-3 py-1.5 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1 w-24">
        <label className="text-xs font-medium text-slate-500">인원</label>
        <input
          type="number"
          min={1}
          placeholder="명"
          defaultValue={params.get("guests") ?? ""}
          onChange={(e) => update("guests", e.target.value)}
          className="rounded border px-3 py-1.5 text-sm"
        />
      </div>

      {hasFilter && (
        <button
          onClick={reset}
          className="rounded border px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50"
        >
          초기화
        </button>
      )}
    </div>
  );
}
