import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: { ignoreDuringBuilds: true },
  env: {
    CRM_ENVIRONMENT: process.env.CRM_ENVIRONMENT || "academy",
  },
};

export default nextConfig;
