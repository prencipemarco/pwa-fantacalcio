const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use experimental.turbo as per recent docs, but error suggested 'turbopack'.
  // We'll try to silence it by providing an empty experimental config at least.
  experimental: {
    turbo: {
      // Empty config to acknowledge turbopack usage
    }
  }
};

module.exports = withPWA(nextConfig);
