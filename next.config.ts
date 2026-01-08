import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-0452874318974edc9edb156680c3ee62.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-0e835b2ce40a424491b937519498cce8.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withFlowbiteReact(nextConfig);