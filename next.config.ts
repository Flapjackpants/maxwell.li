import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@libsql/client"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static.wikia.nocookie.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "minecraft.wiki",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "minecraft.fandom.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
