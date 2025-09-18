import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployments
  output: 'standalone',
  
  // Experimental features
  experimental: {
    // Server actions configuration for file uploads
    serverActions: {
      bodySizeLimit: '10mb' // Configurable file size limit
    }
  },
  
  // Runtime configuration
  serverRuntimeConfig: {
    maxDuration: 60 // Maximum request duration in seconds
  },
  
  // Public runtime configuration
  publicRuntimeConfig: {
    maxFileSize: process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760' // 10MB default
  },
  
  // Compression for better performance
  compress: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
