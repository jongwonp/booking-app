import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // forbidden() / unauthorized() API 사용을 위해 활성화.
    // assertAdmin 등에서 권한 부족을 명시적인 403 페이지로 처리한다.
    authInterrupts: true,
  },
};

export default nextConfig;
