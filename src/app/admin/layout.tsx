import type { ReactNode } from "react";
import { assertAdmin } from "@/lib/admin";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // 나중에 여기에서 세션 검사 → 비관리자면 막기
  await assertAdmin();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r px-4 py-6">
        <h1 className="text-xl font-bold mb-6">Admin</h1>
        <AdminNav />
      </aside>

      <main className="flex-1 px-6 py-6">
        {children}
      </main>
    </div>
  );
}
