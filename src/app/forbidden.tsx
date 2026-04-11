import Link from "next/link";

export default function Forbidden() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-4">
      <h1 className="text-2xl font-semibold">접근 권한이 없습니다</h1>
      <p className="text-sm text-slate-600">
        이 페이지는 관리자 전용입니다. 일반 계정으로는 열람할 수 없습니다.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        홈으로
      </Link>
    </div>
  );
}
