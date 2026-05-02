import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // <--- IMPORTANT: This is required for Docker
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbcdnw.aoneroom.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.aoneroom.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.hakunaymatata.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
