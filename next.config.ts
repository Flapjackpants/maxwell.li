import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@libsql/client", "libsql"],
  outputFileTracingIncludes: {
    "/shop": ["./lib/db/migrations/**/*"],
    "/shop/**/*": ["./lib/db/migrations/**/*"],
    "/api/**/*": ["./lib/db/migrations/**/*"],
  },
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
