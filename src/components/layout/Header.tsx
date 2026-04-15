import Link from "next/link";
import { auth, signOut } from "@/auth";

export async function Header() {
  const session = await auth();
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold">
          Booking App
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/listings">숙소 목록</Link>
          {user && <Link href="/me">내 정보</Link>}
          {user && <Link href="/reservations">내 예약</Link>}
          {isAdmin && <Link href="/admin/listings">관리자</Link>}
          {user ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button type="submit" className="text-slate-500 hover:text-slate-700">
                로그아웃
              </button>
            </form>
          ) : (
            <Link href="/login" className="rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700">
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
