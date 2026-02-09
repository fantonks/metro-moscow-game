/** @type {import('next').NextConfig} */
const isElectronBuild = process.env.BUILD_ELECTRON === '1'

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: process.cwd(),
  },
  ...(isElectronBuild
    ? { output: 'export', assetPrefix: './' }
    : {}),
  images: {
    unoptimized: true,
    // Только локальные изображения из /public
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ]
  },
}

export default nextConfig
