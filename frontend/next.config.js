/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Added for Docker compatibility
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://skillmap-backend-wigj.onrender.com/api",
  },
}

module.exports = nextConfig
