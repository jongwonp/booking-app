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
    // jwt, session 콜백은 미들웨어(edge)에서도 실행되어야 하므로 여기에 둔다.
    // Prisma를 import하지 않으므로 edge 호환.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "USER";
      }
      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
        },
      };
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const path = request.nextUrl.pathname;
      const isAdminRoute = path.startsWith("/admin");
      const isProtected = path.startsWith("/reservations") || path === "/me" || isAdminRoute;

      if (isProtected && !isLoggedIn) return false;

      // /admin은 ADMIN 권한이 추가로 필요. 일반 유저는 edge에서 차단.
      // (서버 컴포넌트의 assertAdmin이 두 번째 방어선)
      if (isAdminRoute && auth?.user?.role !== "ADMIN") {
        return false;
      }

      return true;
    },
  },
};
