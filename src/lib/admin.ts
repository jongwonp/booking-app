import { auth } from "@/auth";
import { forbidden, unauthorized } from "next/navigation";

/**
 * ADMIN 권한 보장. 서버 컴포넌트/서버 액션 어디서든 호출 가능.
 *
 * - 비로그인: unauthorized() → 401 페이지 (app/unauthorized.tsx)
 * - 로그인했지만 일반 유저: forbidden() → 403 페이지 (app/forbidden.tsx)
 *
 * 이전에는 redirect("/")로 조용히 홈으로 보냈지만, 사용자가 왜 차단되었는지
 * 알 수 없어서 명시적인 상태 코드로 분리했다. 미들웨어가 1차 방어선이고
 * 이 함수가 2차 방어선.
 */
export async function assertAdmin() {
  const session = await auth();
  if (!session?.user) {
    unauthorized();
  }
  if (session.user.role !== "ADMIN") {
    forbidden();
  }
}
