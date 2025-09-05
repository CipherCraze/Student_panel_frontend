import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ObjectId } from 'mongodb'
import { requireAuth } from '../../lib/auth'
import { connectToDatabase } from '../../lib/mongodb'
import { handleCors } from '../../lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Verify authentication
    const decoded = requireAuth(req)
    
    const db = await connectToDatabase()
    
    // Get current user data
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(decoded.userId)
    }, { 
      projection: { password: 0 } // Exclude password
    })
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      schoolId: user.schoolId,
      isOnboarded: user.isOnboarded || false
    })

  } catch (error) {
    console.error('Get current user error:', error)
    
    if (error.message === 'Authentication required') {
      return res.status(401).json({ message: 'Authentication required' })
    }
    
    res.status(500).json({ message: 'Internal server error' })
  }
}
