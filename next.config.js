/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Reduce install/build noise on Vercel; still lint locally
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
