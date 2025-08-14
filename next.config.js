/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    // (optionnel) formats plus légers
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
