import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // <--- IMPORTANT: This is required for Docker
  typescript: {
    ignoreBuildErrors: true,
  },
  // We remove the turbopack root override as Docker handles the root automatically
};

export default nextConfig;
