/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Remove trailing slash if the user accidentally added one in Vercel (e.g. https://backend.onrender.com/)
    const apiUrl = process.env.API_URL 
      ? process.env.API_URL.replace(/\/$/, '') 
      : 'http://127.0.0.1:5000';

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
