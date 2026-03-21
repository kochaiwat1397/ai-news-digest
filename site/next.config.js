/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // Required for GitHub Pages: repo is served under /ai-news-digest/
  basePath: isProd ? '/ai-news-digest' : '',
}

module.exports = nextConfig
