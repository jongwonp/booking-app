import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

// Edge(미들웨어)에서 사용하는 설정 — Prisma 어댑터 없음
export const authConfig: NextAuthConfig = {
  providers: [
    // 같은 이메일로 GitHub/Google 양쪽 로그인을 허용하기 위해 linking 활성화.
    // 계정 탈취 방지는 아래 signIn 콜백의 email_verified 검사로 보완.
    GitHub({ allowDangerousEmailAccountLinking: true }),
    Google({ allowDangerousEmailAccountLinking: true }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    signIn({ profile }) {
      // 이메일이 인증된 경우에만 로그인 허용
      // → GitHub, Google 모두 인증된 이메일을 제공하므로 정상 통과
      // → 이메일 미인증 provider가 추가되면 여기서 차단됨
      if (profile?.email_verified === false) return false;
      return true;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isProtected =
        request.nextUrl.pathname.startsWith("/reservations") ||
        request.nextUrl.pathname.startsWith("/admin");
      if (isProtected && !isLoggedIn) return false;
      return true;
    },
  },
};
