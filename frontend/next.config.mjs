/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "oryzalokabasa.com",
      },
      {
        protocol: "http",
        hostname: "154.19.37.25",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
