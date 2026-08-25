import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // St. Francis's portal moved under /stfrancishouston when subme.app's root
  // became the marketing site (paving the way for other schools to get their
  // own path). These keep anyone's old bookmarks/links working. Temporary
  // (not permanent) while the URL structure is still settling.
  async redirects() {
    return [
      { source: "/signin", destination: "/stfrancishouston/signin", permanent: false },
      { source: "/admin/:path*", destination: "/stfrancishouston/admin/:path*", permanent: false },
      { source: "/teacher/:path*", destination: "/stfrancishouston/teacher/:path*", permanent: false },
      { source: "/sub/:path*", destination: "/stfrancishouston/sub/:path*", permanent: false },
      { source: "/respond/:token", destination: "/stfrancishouston/respond/:token", permanent: false },
      { source: "/reset-password/:token", destination: "/stfrancishouston/reset-password/:token", permanent: false },
      { source: "/schools", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
