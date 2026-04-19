/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Docker standalone deployment
  output: 'standalone',

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/:path*`,
      },
    ];
  },

  // Make BACKEND_URL available at runtime for standalone mode
  serverRuntimeConfig: {
    backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
  },
};

export default nextConfig;
