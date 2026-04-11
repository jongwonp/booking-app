/**
 * 간이 인메모리 rate limiter.
 *
 * ⚠️ 한계 — 프로덕션에서 주의할 점
 * ─────────────────────────────────
 * 이 구현은 프로세스 메모리(Map)에 카운터를 보관한다. 단일 Node 프로세스
 * 안에서는 정확하지만, 아래 환경에서는 실효성이 떨어진다:
 *
 *   - 서버리스(Vercel, AWS Lambda 등): 인스턴스마다 Map이 분리되므로
 *     한 사용자가 여러 인스턴스에 분산되면 실제 허용치가 `max × 인스턴스 수`
 *     로 늘어난다. 콜드 스타트마다 카운터가 리셋되기도 한다.
 *   - 수평 확장된 노드 서버: 같은 이유로 인스턴스 간 공유가 안 된다.
 *   - 프로세스 재시작: 카운터가 모두 날아간다.
 *
 * 현재는 기본 가드(명백한 남용 차단) 수준으로만 신뢰할 수 있다.
 * 진지한 rate limiting이 필요해지면 Upstash Redis + sliding window 같은
 * 외부 스토어 기반 구현으로 교체해야 한다.
 *
 * IP 추출도 `x-forwarded-for` 헤더 첫 값만 쓰므로 프록시 신뢰가 필요하다.
 * 악의적 클라이언트가 이 헤더를 위조할 수 있는 환경이면 `req.ip` 또는
 * 플랫폼의 신뢰 가능한 IP(예: Vercel의 `x-real-ip`)로 바꿔야 한다.
 */
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
