/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Set up scheduled deletion of expired items
  async rewrites() {
    return [
      {
        source: '/api/cron/cleanup',
        destination: '/api/cron/cleanup',
      },
    ];
  },
  // Allow server-side Node.js APIs
  experimental: {
    serverComponentsExternalPackages: ['fs', 'path'],
  },
  // Webpack configuration
  webpack: (config: any) => {
    // Handle fs and other Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    
    return config;
  },
};

module.exports = nextConfig;