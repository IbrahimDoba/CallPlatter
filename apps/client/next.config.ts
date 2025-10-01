import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/ai-receptionist/:path*',
        destination: 'http://localhost:3001/api/ai-receptionist/:path*',
      },
      {
        source: '/api/waitlist',
        destination: 'http://localhost:3001/api/waitlist',
      },
    ];
  },
};

export default nextConfig;
