import mongoose, { Mongoose } from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

// Add this for TypeScript global type safety
declare global {
  // eslint-disable-next-line no-var
  var mongoose: { conn: Mongoose | null; promise: Promise<Mongoose> | null } | undefined
}

let cached = global.mongoose

if (!cached) {
  cached = { conn: null, promise: null }
  global.mongoose = cached
}

export async function connectDB() {
  if (!cached) {
    throw new Error('Mongoose cache not initialized')
  }
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts)
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
} 