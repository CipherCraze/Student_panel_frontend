import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../../lib/mongodb'
import { requireAuth } from '../../lib/auth'
import { handleCors } from '../../lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return

  const { method, query } = req
  const { id } = query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'School ID is required' })
  }

  try {
    const decoded = requireAuth(req)
    const db = await connectToDatabase()

    // Check permissions: super admin can access any school, school admin can only access their own
    if (decoded.role === 'school_admin' && decoded.schoolId !== id) {
      return res.status(403).json({ message: 'Access denied' })
    }

    switch (method) {
      case 'GET':
        const school = await db.collection('schools').findOne({ 
          _id: new ObjectId(id) 
        })
        
        if (!school) {
          return res.status(404).json({ message: 'School not found' })
        }

        return res.status(200).json({
          ...school,
          id: school._id.toString(),
          _id: undefined
        })

      case 'PUT':
        // Only super admin can update schools
        if (decoded.role !== 'super_admin') {
          return res.status(403).json({ message: 'Insufficient permissions' })
        }

        const updateData = {
          ...req.body,
          updatedAt: new Date()
        }
        
        delete updateData.id
        delete updateData._id

        const updateResult = await db.collection('schools').updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        )

        if (updateResult.matchedCount === 0) {
          return res.status(404).json({ message: 'School not found' })
        }

        const updatedSchool = await db.collection('schools').findOne({ 
          _id: new ObjectId(id) 
        })

        if (!updatedSchool) {
          return res.status(404).json({ message: 'School not found after update' })
        }

        return res.status(200).json({
          ...updatedSchool,
          id: updatedSchool._id.toString(),
          _id: undefined
        })

      case 'DELETE':
        // Only super admin can delete schools
        if (decoded.role !== 'super_admin') {
          return res.status(403).json({ message: 'Insufficient permissions' })
        }

        const deleteResult = await db.collection('schools').deleteOne({ 
          _id: new ObjectId(id) 
        })

        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ message: 'School not found' })
        }

        return res.status(200).json({ message: 'School deleted successfully' })

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
        return res.status(405).json({ message: `Method ${method} not allowed` })
    }
  } catch (error) {
    console.error('School API error:', error)
    
    if (error.message === 'Authentication required') {
      return res.status(401).json({ message: 'Authentication required' })
    }
    
    return res.status(500).json({ message: 'Internal server error' })
  }
}
