import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // forbidden() / unauthorized() API 사용을 위해 활성화.
    // assertAdmin 등에서 권한 부족을 명시적인 403 페이지로 처리한다.
    authInterrupts: true,
  },
  images: {
    // 외부 이미지 호스트 허용 목록.
    // next/image는 기본적으로 외부 URL을 거부하므로 허용할 호스트를 명시해야 한다.
    // 아직 이미지 호스트가 정해지지 않았으므로 주요 스토리지/CDN을 포함했다.
    // 프로덕션에서는 실제로 쓰는 도메인만 남기고 나머지는 제거하는 게 안전하다.
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.cloudfront.net" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
