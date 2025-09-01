const nextConfig = {
  // Next.js 15 requires dev.allowedOrigins instead of experimental.allowedDevOrigins
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
  dev: {
    allowedOrigins: ["https://destined-tomcat-smooth.ngrok-free.app"],
  },
};

export default nextConfig;
