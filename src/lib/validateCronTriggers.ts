import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';
import { CONFIG } from './config';

export function validateCronTriggers(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  logger.info(`CRON CLIENT API ${ip}`);

  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    const message = 'Bad authentication for CRON request';
    logger.warn(message);
    return NextResponse.json({ message }, { status: 401 });
  }
logger.info(authHeader)
  const token = authHeader.replace('Bearer ', '');
  const expectedToken = CONFIG.CRON_TRIGGER_TOKEN;
logger.info(`Expected token: ${expectedToken} token: ${token}`)
  if (!expectedToken) {
    logger.error('[CRON-VALIDATION] BEARER_TOKEN environment variable not set');
    return NextResponse.json(
      { message: 'Server configuration error' },
      { status: 500 }
    );
  }

  if (token === expectedToken) {
    logger.info('CRON request is authenticated by Bearer token');
    return null; // Continue with the request
  } else {
    const message = 'Bad authentication for CRON request';
    logger.warn(message);
    return NextResponse.json({ message }, { status: 401 });
  }
} 