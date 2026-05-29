// next.config.js — safe version WITHOUT @ducanh2912/next-pwa
// Use this on all branches EXCEPT feat/pwa.
// Copy over next.config.js:
//   cp next.config.no-pwa.js next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'remotive.com' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
    ],
  },
}

// next-intl plugin — only wrap if the package is installed
let config = nextConfig
try {
  const createNextIntlPlugin = require('next-intl/plugin')
  const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')
  config = withNextIntl(nextConfig)
} catch {
  // next-intl not installed on this branch — skip
}

module.exports = config
