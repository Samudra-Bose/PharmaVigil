/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      return [];
    }
    // If backend is on another origin, rewrite /api/v1/* to proxy requests seamlessly
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiBaseUrl.replace(/\/api\/v1\/?$/, '')}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
