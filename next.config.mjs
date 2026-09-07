/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep a validation build separate from a running development preview.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Optional static preview; the standard Next.js build retains live revalidation.
  output: process.env.NEXT_STATIC_EXPORT === '1' ? 'export' : undefined,
  // Image optimization
  images: {
    unoptimized: process.env.NEXT_STATIC_EXPORT === '1',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'opengraph.githubassets.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // Compression
  compress: true,
  // Optimizations
  swcMinify: true,
  productionBrowserSourceMaps: false,
  // Next manages HTML revalidation and immutable caching for hashed assets.
  // Enable React strict mode for development
  experimental: {
    optimizePackageImports: ['framer-motion', '@react-three/fiber'],
  }
};

export default nextConfig;
