/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['example.com'], // Add domains for remote images
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;