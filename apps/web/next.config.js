/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@mustache/ui', '@mustache/types', '@mustache/utils'],
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
}

module.exports = nextConfig