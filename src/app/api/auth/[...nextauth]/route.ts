import NextAuth from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { rateLimit } from '@/lib/rateLimit'
import { NextRequest } from 'next/server'

const handler = NextAuth(authOptions)

function withRateLimit(handler: any) {
  return async (request: NextRequest, ...args: any[]) => {
    const clientIP = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    request.ip ||
                    'unknown';
    const rateLimitResponse = await rateLimit(request, clientIP);
    if (rateLimitResponse) return rateLimitResponse;
    return handler(request, ...args);
  };
}

export const GET = withRateLimit(handler);
export const POST = withRateLimit(handler);
