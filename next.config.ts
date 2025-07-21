import type { NextConfig } from "next"

const domain = process.env.SUPABASE_IMAGE_DOMAIN
if (!domain) {
  throw new Error("SUPABASE_IMAGE_DOMAIN is not defined")
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ['http://192.168.8.100:3000'],
  images: {
    domains: [
      'kdrkwbhqtyimtndwteve.supabase.co',
    ],
  },
}

export default nextConfig
