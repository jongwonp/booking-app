import { NextResponse } from "next/server";

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

// 주기적으로 만료된 엔트리 정리 (메모리 누수 방지)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}, 60_000);

type RateLimitOptions = {
  /** 윈도우 내 최대 요청 수 */
  max: number;
  /** 윈도우 크기 (밀리초) */
  windowMs: number;
};

const defaults: RateLimitOptions = { max: 30, windowMs: 60_000 };

/**
 * IP 기반 rate limiter.
 * 초과 시 429 NextResponse를 반환, 통과 시 null 반환.
 */
export function rateLimit(
  req: Request,
  opts: Partial<RateLimitOptions> = {},
): NextResponse | null {
  const { max, windowMs } = { ...defaults, ...opts };

  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const key = `${ip}:${new URL(req.url).pathname}`;

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  entry.count++;

  if (entry.count > max) {
    return NextResponse.json(
      { ok: false, error: "too-many-requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
        },
      },
    );
  }

  return null;
}
