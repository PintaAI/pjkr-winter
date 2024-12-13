declare module 'next-pwa' {
  import type { NextConfig } from 'next'

  type PWAConfig = {
    dest?: string
    disable?: boolean
    register?: boolean
    scope?: string
    sw?: string
    skipWaiting?: boolean
  }

  export default function withPWA(config?: PWAConfig): (nextConfig: NextConfig) => NextConfig
}
