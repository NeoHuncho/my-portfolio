const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  reactStrictMode: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 31536000,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compress: true,
  // Frozen past versions of the site live in public/versions/<id>/ as static exports.
  rewrites: async () => [
    { source: '/versions/:id', destination: '/versions/:id/index.html' },
    { source: '/versions/:id/', destination: '/versions/:id/index.html' },
    {
      source: '/versions/:id/:page(about-me|my-projects)',
      destination: '/versions/:id/:page/index.html',
    },
    {
      source: '/versions/:id/:page(about-me|my-projects)/',
      destination: '/versions/:id/:page/index.html',
    },
  ],
  // Immutable caching only for production: dev chunk URLs are not content-hashed.
  headers: async () =>
    process.env.NODE_ENV !== 'production'
      ? []
      : [
          {
            source: '/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2)',
            headers: [
              {
                key: 'Cache-Control',
                value: 'public, max-age=31536000, immutable',
              },
            ],
          },
          {
            source: '/versions/:id/_next/static/:path*',
            headers: [
              {
                key: 'Cache-Control',
                value: 'public, max-age=31536000, immutable',
              },
            ],
          },
          {
            source: '/_next/static/:path*',
            headers: [
              {
                key: 'Cache-Control',
                value: 'public, max-age=31536000, immutable',
              },
            ],
          },
        ],
});
