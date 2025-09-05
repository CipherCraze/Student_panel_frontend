import jwt from 'jsonwebtoken'
import { VercelRequest } from '@vercel/node'

export interface DecodedToken {
  userId: string
  role: string
  schoolId?: string
  iat: number
  exp: number
}

export function generateToken(payload: { userId: string; role: string; schoolId?: string }): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined')
  }
  
  return jwt.sign(payload, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
  })
}

export function verifyToken(token: string): DecodedToken {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined')
  }
  
  return jwt.verify(token, process.env.JWT_SECRET) as DecodedToken
}

export function getTokenFromRequest(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return null
}

export function requireAuth(req: VercelRequest): DecodedToken {
  const token = getTokenFromRequest(req)
  
  if (!token) {
    throw new Error('Authentication required')
  }
  
  return verifyToken(token)
}

export function requireRole(req: VercelRequest, allowedRoles: string[]): DecodedToken {
  const decoded = requireAuth(req)
  
  if (!allowedRoles.includes(decoded.role)) {
    throw new Error('Insufficient permissions')
  }
  
  return decoded
}
