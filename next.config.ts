import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      // Supabase Storage 이미지 허용
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Server Actions body size limit 증가 (5MB → 10MB로 여유있게 설정)
  serverActions: {
    bodySizeLimit: "10mb",
  },
};

export default nextConfig;
