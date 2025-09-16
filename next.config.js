/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Remove the deprecated 'appDir' option
    // appDir is now stable in Next.js 15, no need to specify it
  },
}

module.exports = nextConfig