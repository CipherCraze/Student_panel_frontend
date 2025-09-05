import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '../../lib/mongodb'
import { generateToken } from '../../lib/auth'
import { handleCors } from '../../lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { name, email, password, role = 'school_admin' } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    const db = await connectToDatabase()
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email })
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role,
      isOnboarded: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('users').insertOne(newUser)
    
    // Generate JWT token
    const token = generateToken({
      userId: result.insertedId.toString(),
      role: newUser.role
    })

    // Return user data and token
    res.status(201).json({
      token,
      user: {
        id: result.insertedId.toString(),
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        isOnboarded: newUser.isOnboarded
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
