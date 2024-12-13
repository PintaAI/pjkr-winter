import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

const config = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
})(nextConfig);

export default config;
