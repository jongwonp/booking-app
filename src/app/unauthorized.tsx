import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-4">
      <h1 className="text-2xl font-semibold">로그인이 필요합니다</h1>
      <p className="text-sm text-slate-600">
        이 페이지를 보려면 먼저 로그인해주세요.
      </p>
      <Link
        href="/login"
        className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        로그인
      </Link>
    </div>
  );
}
