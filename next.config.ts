// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   reactCompiler: true,
//   images: {
//     domains: ["encrypted-tbn0.gstatic.com"],
//   },
// };

// export default nextConfig;
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "2qs5yuwadb.ucarecd.net",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
