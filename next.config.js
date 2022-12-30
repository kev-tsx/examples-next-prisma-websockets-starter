/**
 * @link https://nextjs.org/docs/api-reference/next.config.js/introduction
 */

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.com',
        pathname: '/PokeAPI/sprites/master/sprites/pokemon/**',
      },
      {
        protocol: 'https',
        hostname: '**.co',
        pathname: '/api/v2/pokemon/**',
      },
    ],
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    APP_URL: process.env.APP_URL,
    WS_URL: process.env.WS_URL,
  },
};
