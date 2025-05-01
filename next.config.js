module.exports = {
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
      ],
    },
  };