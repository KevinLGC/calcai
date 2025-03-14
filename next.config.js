/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    esmExternals: true
  },
  compiler: {
    styledComponents: true
  },
  typescript: {
    ignoreBuildErrors: false
  }
}

module.exports = nextConfig 