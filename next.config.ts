import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: { ignoreDuringBuilds: true },
  env: {
    NEXT_PUBLIC_CRM_ENVIRONMENT:
      process.env.NEXT_PUBLIC_CRM_ENVIRONMENT || "academy",
  },
};

export default nextConfig;
