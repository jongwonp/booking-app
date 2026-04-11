import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

// jwt/session/authorized 콜백은 모두 authConfig에 정의되어 있다(edge 호환).
// 여기서는 Prisma 어댑터와 JWT 세션 전략만 추가.
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
});
