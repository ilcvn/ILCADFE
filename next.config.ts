import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { hostname: 'utfs.io', port: '', protocol: 'https' },
      { hostname: 'ub9cgsg2zg.ufs.sh', port: '', protocol: 'https' },
    ],
  },
  /* config options here */
};

export default nextConfig;
