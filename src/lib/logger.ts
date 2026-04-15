/**
 * 서버 사이드 에러 로깅 추상화.
 *
 * 현재는 console.error로 출력하지만, 프로덕션에서 외부 에러 추적 서비스
 * (Sentry, Datadog 등)를 도입할 때 이 파일만 교체하면 된다.
 *
 * 사용법:
 *   import { logger } from "@/lib/logger";
 *   logger.error("예약 생성 실패", { error: e, userId, listingId });
 */

type LogContext = Record<string, unknown>;

function error(message: string, context?: LogContext) {
  console.error(`[ERROR] ${message}`, context ?? "");

  // TODO: 외부 에러 추적 서비스 연동 시 여기에 추가
  // 예: Sentry.captureException(context?.error, { extra: context });
}

function warn(message: string, context?: LogContext) {
  console.warn(`[WARN] ${message}`, context ?? "");
}

function info(message: string, context?: LogContext) {
  console.info(`[INFO] ${message}`, context ?? "");
}

export const logger = { error, warn, info };
