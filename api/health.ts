import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors } from '../lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
}
