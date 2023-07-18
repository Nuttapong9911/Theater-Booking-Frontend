/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/movies',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig
