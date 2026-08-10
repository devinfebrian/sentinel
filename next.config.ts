import type { NextConfig } from "next";
import path from "path";

// Browser calls stay same-origin and Next forwards them, so CORS never enters
// the picture and the access token never crosses to another origin.
// Falls back to a local backend when BACKEND_URL is unset.
const backendUrl = process.env.BACKEND_URL ?? "http://127.0.0.1:5000";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
