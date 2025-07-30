/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  assetPrefix: '/',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
