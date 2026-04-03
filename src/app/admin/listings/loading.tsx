import Spinner from "@/components/ui/Spinner";

export default function AdminListingsLoading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <Spinner />
      <p className="text-sm text-slate-500">관리자용 숙소 목록을 불러오는 중입니다...</p>
    </div>
  );
}
