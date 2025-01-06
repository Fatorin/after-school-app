import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: false,
  }
};

export default nextConfig;
