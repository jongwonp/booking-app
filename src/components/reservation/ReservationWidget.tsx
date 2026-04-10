"use client";
import { useEffect, useMemo, useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { ko } from "date-fns/locale";
import { isBefore, isWithinInterval, startOfDay } from "date-fns";
import "react-day-picker/style.css";
import {
  createReservation,
  confirmReservation,
  cancelReservation,
} from "@/lib/api";
import { toDateOnly } from "@/lib/date";
import Button from "@/components/ui/Button";

type BookedRange = { from: string; to: string };
type PriceRuleInput = {
  startDate: string;
  endDate: string;
  type: "OVERRIDE" | "PERCENT";
  value: number;
};

export default function ReservationWidget({
  listingId,
  nightlyPrice,
  maxGuests,
  bookedRanges = [],
  blockedRanges = [],
  priceRules = [],
}: {
  listingId: string;
  nightlyPrice: number;
  maxGuests: number;
  bookedRanges?: BookedRange[];
  blockedRanges?: BookedRange[];
  priceRules?: PriceRuleInput[];
}) {
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState<number>(1);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
  const [remainSec, setRemainSec] = useState<number | null>(null);

  // HOLD 만료 카운트다운
  useEffect(() => {
    if (!holdExpiresAt || status !== "HOLD") {
      setRemainSec(null);
      return;
    }
    const tick = () => {
      const left = Math.floor((holdExpiresAt.getTime() - Date.now()) / 1000);
      if (left <= 0) {
        setRemainSec(0);
        setStatus("EXPIRED");
        setMsg({ type: "err", text: "HOLD 시간이 만료되었습니다. 새로 예약해주세요." });
      } else {
        setRemainSec(left);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [holdExpiresAt, status]);

  const today = startOfDay(new Date());

  // 예약 불가 날짜 범위 (react-day-picker disabled prop용)
  const disabledRanges = useMemo(
    () =>
      [...bookedRanges, ...blockedRanges].map((r) => ({
        from: startOfDay(new Date(r.from)),
        to: startOfDay(new Date(r.to)),
      })),
    [bookedRanges, blockedRanges]
  );

  const nights = useMemo(() => {
    if (!range?.from || !range?.to) return 0;
    const d = Math.ceil((+range.to - +range.from) / 86_400_000);
    return d > 0 ? d : 0;
  }, [range]);

  const total = useMemo(() => {
    if (!range?.from || !range?.to || nights < 1) return 0;
    let sum = 0;
    const cursor = new Date(range.from);
    const end = new Date(range.to);
    while (cursor < end) {
      const rule = priceRules.find((r) => {
        const s = new Date(r.startDate);
        const e = new Date(r.endDate);
        return cursor >= s && cursor < e;
      });
      if (rule) {
        sum += rule.type === "OVERRIDE"
          ? rule.value
          : Math.round(nightlyPrice * (1 + rule.value / 100));
      } else {
        sum += nightlyPrice;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return sum;
  }, [range, nights, nightlyPrice, priceRules]);

  // 선택한 범위가 예약된 날짜와 겹치는지 검사
  const hasConflict = useMemo(() => {
    if (!range?.from || !range?.to) return false;
    return disabledRanges.some(
      (r) =>
        isWithinInterval(r.from, { start: range.from!, end: range.to! }) ||
        isWithinInterval(r.to, { start: range.from!, end: range.to! }) ||
        (isBefore(r.from, range.from!) && isBefore(range.to!, r.to))
    );
  }, [range, disabledRanges]);

  async function onCreate() {
    if (nights < 1 || !range?.from || !range?.to) {
      setMsg({ type: "err", text: "날짜를 선택해주세요." });
      return;
    }
    if (hasConflict) {
      setMsg({ type: "err", text: "선택한 날짜에 이미 예약이 있습니다." });
      return;
    }
    if (guests < 1 || guests > maxGuests) {
      setMsg({ type: "err", text: `인원은 1명 이상 ${maxGuests}명 이하여야 합니다.` });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const r = await createReservation({
        listingId,
        checkIn: toDateOnly(range.from),
        checkOut: toDateOnly(range.to),
        guests,
      });
      setReservationId(r.id);
      setStatus(r.status);
      setHoldExpiresAt(new Date(r.holdExpiresAt));
      setMsg({ type: "ok", text: "예약이 HOLD로 생성되었습니다. 30분 이내에 확정해주세요." });
    } catch (e: any) {
      const text =
        e?.message === "conflict"
          ? "선택한 날짜에 이미 다른 예약이 있습니다. 날짜를 바꿔보세요."
          : e?.message === "too-many-guests"
          ? `인원이 숙소 최대 인원(${maxGuests}명)을 초과했습니다.`
          : e?.message === "blocked"
          ? "선택한 날짜는 예약이 차단되어 있습니다."
          : "예약 생성에 실패했습니다. 잠시 후 다시 시도해주세요.";
      setMsg({ type: "err", text });
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
      setHoldExpiresAt(null);
      setMsg({ type: "ok", text: "예약이 확정되었습니다." });
    } catch (e: any) {
      if (e?.message === "hold-expired") {
        setStatus("EXPIRED");
        setHoldExpiresAt(null);
        setMsg({ type: "err", text: "HOLD 시간이 만료되었습니다. 새로 예약해주세요." });
      } else {
        setMsg({ type: "err", text: e?.message === "conflict" ? "다른 예약과 날짜가 겹칩니다." : "확정에 실패했습니다." });
      }
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

  return (
    <div className="space-y-3 rounded-2xl border p-4 shadow-sm">
      <DayPicker
        mode="range"
        selected={range}
        onSelect={setRange}
        locale={ko}
        disabled={[{ before: today }, ...disabledRanges]}
        numberOfMonths={1}
        classNames={{
          root: "text-sm",
          selected: "bg-indigo-600 text-white rounded",
          range_middle: "bg-indigo-100",
          range_start: "bg-indigo-600 text-white rounded-l",
          range_end: "bg-indigo-600 text-white rounded-r",
          disabled: "text-red-300 line-through opacity-50 cursor-not-allowed",
        }}
      />

      <div className="flex items-center justify-between gap-3 text-sm">
        <label htmlFor="guests" className="font-medium text-gray-700">
          인원
        </label>
        <input
          id="guests"
          type="number"
          min={1}
          max={maxGuests}
          value={guests}
          onChange={(e) => setGuests(Math.max(1, Math.min(maxGuests, Number(e.target.value) || 1)))}
          className="w-20 rounded border px-2 py-1 text-right text-sm"
        />
        <span className="text-xs text-gray-500">최대 {maxGuests}명</span>
      </div>

      <div className="text-sm text-gray-700">
        1박당 ₩{nightlyPrice?.toLocaleString()} ·{" "}
        {nights > 0 ? (
          <>
            {nights}박 합계 ₩{total.toLocaleString()}
          </>
        ) : (
          "날짜를 선택하세요"
        )}
      </div>

      {hasConflict && (
        <p className="text-xs text-red-500">선택한 범위에 이미 예약된 날짜가 포함되어 있습니다.</p>
      )}

      {status === "HOLD" && remainSec !== null && remainSec > 0 && (
        <div className="rounded-md bg-yellow-100 px-3 py-2 text-sm text-yellow-800">
          HOLD 남은 시간: <span className="font-semibold">{Math.floor(remainSec / 60)}분 {remainSec % 60}초</span> — 시간 내에 확정해주세요.
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={onCreate}
          data-testid="reserve"
          disabled={loading || nights < 1 || hasConflict}
        >
          {loading ? "처리중..." : reservationId ? "새 예약 생성" : "예약 만들기(HOLD)"}
        </Button>

        <Button
          onClick={onConfirm}
          disabled={!reservationId || loading || status === "CONFIRMED" || status === "EXPIRED"}
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
                : status === "EXPIRED"
                ? "inline-flex items-center rounded-full bg-red-200 px-2 py-0.5 text-[11px] font-semibold text-red-900"
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
