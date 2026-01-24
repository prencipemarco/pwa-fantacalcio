const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  workboxOptions: {
    importScripts: ['/push-worker.js'],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Silence Turbopack error by adding empty config at root level as suggested by error logs.
  // Use ts-ignore because local NextConfig types might not have this property yet.
  // @ts-ignore
  turbopack: {}
};

module.exports = withPWA(nextConfig);
