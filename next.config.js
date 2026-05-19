/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const repo = "trainings";
const basePath = isProd ? `/${repo}` : "";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  assetPrefix: isProd ? `/${repo}/` : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

module.exports = nextConfig;
