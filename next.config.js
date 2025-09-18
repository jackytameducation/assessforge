/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure TypeScript
  typescript: {
    // Type errors will be shown during build
    ignoreBuildErrors: false,
  },
  
  // Configure ESLint to allow builds despite warnings
  eslint: {
    // Don't fail builds on ESLint warnings, but still show them
    ignoreDuringBuilds: false,
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Configure headers for better security
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
