module.exports = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'hamlethub-prod-images.s3.amazonaws.com',
          pathname: '/**',
        },
      ],
    },
  };