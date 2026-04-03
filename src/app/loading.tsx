import Spinner from "@/components/ui/Spinner";

export default function RootLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Spinner />
      <p className="text-sm text-slate-500">페이지를 불러오는 중입니다...</p>
    </div>
  );
}
