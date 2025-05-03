/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'hamlethub-prod-images.s3.amazonaws.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'storage.cloud.google.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'storage.googleapis.com',
          pathname: '/**',
        },
        // Google Ads domains
        {
          protocol: 'https',
          hostname: 'securepubads.g.doubleclick.net',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'googleads.g.doubleclick.net',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'www.googletagservices.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'adservice.google.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'pagead2.googlesyndication.com',
          pathname: '/**',
        },
      ],
    },
    // Allow HTTP requests for local development
    transpilePackages: [],
    // Disable strict mode during development
    reactStrictMode: false,
};

// Only apply CSP in production
if (process.env.NODE_ENV === 'production') {
  nextConfig.headers = async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://securepubads.g.doubleclick.net https://*.g.doubleclick.net https://*.googlesyndication.com https://www.googletagservices.com https://adservice.google.com https://pagead2.googlesyndication.com https://*.google.com; connect-src 'self' https://securepubads.g.doubleclick.net https://*.doubleclick.net https://*.g.doubleclick.net https://*.googlesyndication.com https://*.google.com https://*.googleapis.com https://*.google-analytics.com https://*.googleadservices.com https://adservice.google.com https://pagead2.googlesyndication.com https://ep1.adtrafficquality.google; frame-src 'self' https://*.doubleclick.net https://googleads.g.doubleclick.net https://securepubads.g.doubleclick.net https://*.googlesyndication.com https://tpc.googlesyndication.com https://*.google.com; frame-ancestors 'self' https://*.google.com https://*.doubleclick.net https://*.googlesyndication.com; img-src 'self' data: https: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:;`,
          },
        ],
      },
    ];
  };
} else {
  // In development, add a permissive CSP that allows everything
  nextConfig.headers = async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; frame-ancestors *; style-src * 'unsafe-inline';",
          },
        ],
      },
    ];
  };
}

module.exports = nextConfig;