import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

// Edge(미들웨어)에서 사용하는 설정 — Prisma 어댑터 없음
export const authConfig: NextAuthConfig = {
  providers: [
    GitHub({ allowDangerousEmailAccountLinking: true }),
    Google({ allowDangerousEmailAccountLinking: true }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
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
