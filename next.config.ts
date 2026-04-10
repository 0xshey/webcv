import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@react-pdf/renderer', 'docx'],
}

export default nextConfig
