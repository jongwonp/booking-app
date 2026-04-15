import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// 미들웨어는 Edge에서 실행되므로 Prisma 없는 authConfig만 사용
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/reservations/:path*", "/admin/:path*", "/me"],
};
