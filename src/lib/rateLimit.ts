import { NextRequest, NextResponse } from 'next/server';
import { redisClient } from './redis';
import { logger } from './logger';

const WINDOW_SECONDS = Math.floor((Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000);
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 5;

export async function rateLimit(request: NextRequest, key: string) {
  //await redisClient.connect();
  const redisKey = `ratelimit:${key}`;
  const field = 'count';
  try {
    // Increment the count in the hash
    const count = await redisClient.hIncrBy(redisKey, field, 1);

    if (count === 1) {
      // Set expiry on first request
      await redisClient.expire(redisKey, WINDOW_SECONDS);
    }

    if (count > MAX_REQUESTS) {
      logger.warn(`Rate limit exceeded for key: ${key}. Count: ${count}`);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    logger.info('Rate limit not exceeded for key: '+key+'. Count: '+count);
    return null; // Allowed
  } catch (error) {
    logger.error('Rate limiting error (allowing request):', error);
    return null; // Allow the request if Redis is down
  }
} 