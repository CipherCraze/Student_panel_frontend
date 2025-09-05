import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../../lib/mongodb'
import { requireRole } from '../../lib/auth'
import { handleCors } from '../../lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return

  const { method } = req
  const db = await connectToDatabase()

  try {
    switch (method) {
      case 'GET':
        // Get all schools (super admin only)
        requireRole(req, ['super_admin'])
        
        const schools = await db.collection('schools').find({}).toArray()
        
        return res.status(200).json(schools.map(school => ({
          ...school,
          id: school._id.toString(),
          _id: undefined
        })))

      case 'POST':
        // Create new school
        requireRole(req, ['super_admin'])
        
        const { name, board, adminContact } = req.body
        
        if (!name || !board || !adminContact) {
          return res.status(400).json({ message: 'Name, board, and admin contact are required' })
        }

        const newSchool = {
          name,
          board,
          adminContact,
          totalStudents: 0,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        }

        const result = await db.collection('schools').insertOne(newSchool)
        
        return res.status(201).json({
          ...newSchool,
          id: result.insertedId.toString()
        })

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).json({ message: `Method ${method} not allowed` })
    }
  } catch (error) {
    console.error('Schools API error:', error)
    
    if (error.message === 'Authentication required') {
      return res.status(401).json({ message: 'Authentication required' })
    }
    
    if (error.message === 'Insufficient permissions') {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }
    
    return res.status(500).json({ message: 'Internal server error' })
  }
}
