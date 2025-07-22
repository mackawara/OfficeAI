import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import { isEmailAllowed } from '@/lib/emailValidation'
import type { AuthOptions, Session, User as NextAuthUser } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import UserModel from '@/models/User'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Check if email is allowed before attempting authentication
        if (!isEmailAllowed(credentials.email)) {
          console.log(`Login attempt blocked for unauthorized email: ${credentials.email}`)
          return null
        }

        try {
          await connectDB()
          const user = await UserModel.findOne({ email: credentials.email })
          if (!user) {
            return null
          }
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          if (!isPasswordValid) {
            return null
          }
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: NextAuthUser }) {
      if (user) {
        token.id = (user as any).id
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string
      }
      return session
    },
  },
} 