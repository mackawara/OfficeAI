import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { isEmailAllowed } from '@/lib/emailValidation'
import { rateLimit } from '@/lib/rateLimit'

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema)

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    request.ip ||
                    'unknown'

    // Check rate limit
    const rateLimitResponse = await rateLimit(request, clientIP)
    if (rateLimitResponse) return rateLimitResponse

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if email is allowed
    if (!isEmailAllowed(email)) {
      return NextResponse.json(
        { error: 'This email address is not authorized for signup' },
        { status: 403 }
      )
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    const user = new UserModel({
      email,
      password: hashedPassword,
      name,
    })

    await user.save()

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
} 