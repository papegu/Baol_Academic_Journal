/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Reduce install/build noise on Vercel; still lint locally
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev }) => {
    // Workaround for Windows UNKNOWN/EPERM errors on filesystem cache/renames
    // Disable Webpack persistent filesystem cache in dev
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
