"use client";

import Button from "@/components/ui/Button";

export default function RootError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <div className="card">
      <div className="h1">문제가 발생했어요</div>
      <p className="muted">{error.message}</p>
      <Button className="button" onClick={reset}>다시 시도</Button>
    </div>
  );
}
