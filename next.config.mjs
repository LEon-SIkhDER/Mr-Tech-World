/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // hostname: 'res.cloudinary.com',
        hostname: '**',
      },
      {
        protocol: 'https',
        // hostname: 'img.daisyui.com',
        hostname: '**',
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // images:{}
};

export default nextConfig;
