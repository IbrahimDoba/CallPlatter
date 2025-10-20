import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.marblecms.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
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
