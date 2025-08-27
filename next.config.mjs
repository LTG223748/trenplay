/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@coral-xyz/anchor"],
  images: {
    // You can keep this if you want to disable Next's built-in image optimization
    // (useful if you're deploying to a platform without the Image Optimization server)
    unoptimized: true,
  },
};

export default nextConfig;
