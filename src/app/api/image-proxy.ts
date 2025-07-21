// pages/api/image-proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next'
// No need to import fetch; use the native fetch API available in Node.js (v18+) or Next.js

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const imageUrl = req.query.url as string
  if (!imageUrl || !imageUrl.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL' })
  }

  const response = await fetch(imageUrl)
  const contentType = response.headers.get('content-type') || 'image/jpeg'

  res.setHeader('Content-Type', contentType)
  const buffer = await response.arrayBuffer()
  res.status(200).send(Buffer.from(buffer))
}
