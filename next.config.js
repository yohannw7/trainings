/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
// GitHub Pages serves the site under /<repo>/ (here: /trainings)
const repo = "trainings";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : "",
};

module.exports = nextConfig;
