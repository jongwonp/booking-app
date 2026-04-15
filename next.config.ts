import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // X-Powered-By: Next.js 헤더를 제거.
  // 공격자에게 프레임워크 정보를 노출할 필요가 없다.
  poweredByHeader: false,

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
  async headers() {
    return [
      {
        // 모든 경로에 보안 헤더 적용
        source: "/(.*)",
        headers: [
          // iframe으로 감싸서 피싱/클릭재킹에 악용하는 것을 방지
          { key: "X-Frame-Options", value: "DENY" },
          // 브라우저의 MIME 타입 추측을 금지 (예: JS를 이미지로 위장 방지)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // 다른 사이트로 이동할 때 이 사이트의 전체 URL이 유출되지 않도록 제한
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // 카메라, 마이크, 위치 등 브라우저 기능을 제한 (예약 앱에 불필요)
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
