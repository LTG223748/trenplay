/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@coral-xyz/anchor'],
  output: 'export',              // ✅ ensures static HTML build in /out
  images: {
    unoptimized: true            // ✅ required for next export (no Image Optimization server)
  }
};

export default nextConfig;
