"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function Pagination({
  currentPage,
  totalPages,
  basePath = "/listings",
}: {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}) {
  const searchParams = useSearchParams();

  function pageHref(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  }

  // 표시할 페이지 번호 범위 계산 (최대 5개)
  const range: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = Math.max(1, end - 4); i <= end; i++) {
    range.push(i);
  }

  const base = "inline-flex items-center justify-center rounded px-3 py-1.5 text-sm";
  const active = "bg-slate-900 text-white";
  const inactive = "border hover:bg-slate-50 text-slate-700";

  return (
    <nav className="flex items-center justify-center gap-1 pt-2">
      {currentPage > 1 && (
        <Link href={pageHref(currentPage - 1)} className={`${base} ${inactive}`}>
          이전
        </Link>
      )}

      {range[0] > 1 && (
        <>
          <Link href={pageHref(1)} className={`${base} ${inactive}`}>1</Link>
          {range[0] > 2 && <span className="px-1 text-slate-400">...</span>}
        </>
      )}

      {range.map((p) => (
        <Link
          key={p}
          href={pageHref(p)}
          className={`${base} ${p === currentPage ? active : inactive}`}
        >
          {p}
        </Link>
      ))}

      {range[range.length - 1] < totalPages && (
        <>
          {range[range.length - 1] < totalPages - 1 && (
            <span className="px-1 text-slate-400">...</span>
          )}
          <Link href={pageHref(totalPages)} className={`${base} ${inactive}`}>
            {totalPages}
          </Link>
        </>
      )}

      {currentPage < totalPages && (
        <Link href={pageHref(currentPage + 1)} className={`${base} ${inactive}`}>
          다음
        </Link>
      )}
    </nav>
  );
}
