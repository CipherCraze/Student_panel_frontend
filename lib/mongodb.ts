import { MongoClient, Db } from 'mongodb'

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable')
  }

  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  
  const db = client.db('node-speak-genie') // Use your database name
  
  cachedClient = client
  cachedDb = db
  
  return db
}

export { cachedClient, cachedDb }
