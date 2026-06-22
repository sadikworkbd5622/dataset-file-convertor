/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // If API_URL is set in the environment (e.g., on Vercel), it routes to your Render backend.
    // Otherwise, it defaults to your local Flask development server.
    const destination = process.env.API_URL 
      ? `${process.env.API_URL}/api/:path*` 
      : 'http://127.0.0.1:5000/api/:path*';

    return [
      {
        source: '/api/:path*',
        destination: destination,
      },
    ];
  },
};

export default nextConfig;
