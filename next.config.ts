import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'https://api.support4funtalk.com/:path*',
      },
    ];
  },
};

export default nextConfig;
