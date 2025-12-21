/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['srv1210119.hstgr.cloud', 'newsai-backend-855091632688.us-east4.run.app'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '72.62.83.18',
        port: '',
        pathname: '/**',
      }
    ]
  }
}

module.exports = nextConfig
// exported above
