const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (!API_BASE) {
      return [
        {
          source: '/api/:path*',
          destination: '/api/:path*',
        },
      ];
    }

    return [
      {
        source: '/api/:path*',
        destination: `${API_BASE}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;
