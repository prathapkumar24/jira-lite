import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/login', // What the user types in their browser URL bar
        destination: '/signin', // Which folder path Next.js actually reads
      },
    ];
  },
};

export default nextConfig;
