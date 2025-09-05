import { VercelRequest, VercelResponse } from '@vercel/node'

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://student-panel-frontend-eight.vercel.app',
  'https://student-panel-frontend-q1q9sldt4-noel-manojs-projects.vercel.app'
]

export function setCorsHeaders(req: VercelRequest, res: VercelResponse): void {
  const origin = req.headers.origin
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  } else {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0])
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
}

export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  setCorsHeaders(req, res)
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return true
  }
  
  return false
}
