"use client";
import { useMemo, useState } from "react";
import {
  createReservation,
  confirmReservation,
  cancelReservation,
} from "@/lib/api";
import Button from "@/components/ui/Button";

export default function ReservationWidget({
  listingId,
  userId,
  nightlyPrice,
}: {
  listingId: string;
  userId: string;
  nightlyPrice: number;
}) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const todayStr = new Date().toISOString().slice(0, 10);
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const a = new Date(checkIn),
      b = new Date(checkOut);
    const d = Math.ceil((+b - +a) / 86_400_000);
    return d > 0 ? d : 0;
  }, [checkIn, checkOut]);

  const total = nights * (nightlyPrice ?? 0);

  const iso = (d: string) => (d ? new Date(d).toISOString() : "");

  async function onCreate() {
    if (nights < 1) {
      setMsg({
        type: "err",
        text: "체크아웃 날짜는 체크인보다 나중이어야 합니다.",
      });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const r = await createReservation({
        listingId,
        userId,
        checkIn: iso(checkIn),
        checkOut: iso(checkOut),
      });
      setReservationId(r.id);
      setStatus(r.status);
      setMsg({ type: "ok", text: "예약이 HOLD로 생성되었습니다." });
    } catch (e: any) {
      setMsg({
        type: "err",
        text:
          e?.message === "conflict"
            ? "선택한 날짜에 이미 다른 예약이 있습니다. 날짜를 바꿔보세요."
            : "예약 생성에 실패했습니다. 잠시 후 다시 시도해주세요.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function onConfirm() {
    if (!reservationId) return;
    setLoading(true);
    setMsg(null);
    try {
      const r = await confirmReservation(reservationId);
      setStatus(r.status);
      setMsg({ type: "ok", text: "예약이 확정되었습니다." });
    } catch (e: any) {
      setMsg({ type: "err", text: e?.message || "확정 실패" });
    } finally {
      setLoading(false);
    }
  }

  async function onCancel() {
    if (!reservationId) return;
    setLoading(true);
    setMsg(null);
    try {
      await cancelReservation(reservationId);
      setStatus("CANCELLED");
      setMsg({ type: "ok", text: "예약이 취소되었습니다." });
    } catch (e: any) {
      setMsg({ type: "err", text: e?.message || "취소 실패" });
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || nights < 1;

  return (
    <div className="space-y-3 rounded-2xl border p-4 shadow-sm">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-sm">
          체크인
          <input
            type="date"
            min={todayStr}
            className="mt-1 w-full rounded border p-2 text-sm"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            data-testid="checkin" /* ✅ 테스트용 ID */
          />
        </label>
        <label className="text-sm">
          체크아웃
          <input
            type="date"
            min={checkIn || todayStr}
            className="mt-1 w-full rounded border p-2"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            data-testid="checkout" /* ✅ 테스트용 ID */
          />
        </label>
      </div>

      <div className="text-sm text-gray-700">
        1박당 ₩{nightlyPrice?.toLocaleString() ?? "0"} ·
        {nights > 0 ? (
          <>
            {" "}
            {nights}박 합계 ₩{total.toLocaleString()}
          </>
        ) : (
          " 날짜를 선택하세요"
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={onCreate} data-testid="reserve" disabled={disabled}>
          {loading
            ? "처리중..."
            : reservationId
            ? "새 예약 생성"
            : "예약 만들기(HOLD)"}
        </Button>

        <Button
          onClick={onConfirm}
          disabled={!reservationId || loading || status === "CONFIRMED"}
          data-testid="confirm"
          variant="secondary"
        >
          확정하기
        </Button>

        <Button
          onClick={onCancel}
          disabled={!reservationId || loading || status === "CANCELLED"}
          variant="ghost"
        >
          취소하기
        </Button>
      </div>

      {msg && (
        <div
          className={
            msg.type === "ok"
              ? "rounded-md bg-green-300 px-3 py-2 text-sm text-green-800"
              : "rounded-md bg-red-300 px-3 py-2 text-sm text-red-800"
          }
        >
          {msg.text}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-600">
        <div>
          상태:{" "}
          <span
            data-testid="status"
            className={
              status === "CONFIRMED"
                ? "inline-flex items-center rounded-full bg-green-200 px-2 py-0.5 text-[11px] font-semibold text-green-900"
                : status === "HOLD"
                ? "inline-flex items-center rounded-full bg-yellow-200 px-2 py-0.5 text-[11px] font-semibold text-yellow-900"
                : status === "CANCELLED"
                ? "inline-flex items-center rounded-full bg-gray-300 px-2 py-0.5 text-[11px] font-semibold text-gray-900"
                : "inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-800"
            }
          >
            {status ?? "NONE"}
          </span>
        </div>

        {reservationId && (
          <div className="text-[11px] text-gray-400">ID: {reservationId}</div>
        )}
      </div>
    </div>
  );
}
