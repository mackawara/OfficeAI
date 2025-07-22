import { logger } from '@/lib/logger'

export function isEmailAllowed(email: string): boolean {
  const allowedEmails = process.env.ALLOWED_EMAILS?.split(',').map(e => e.trim()) || []
  // If no allowed emails are configured, allow all emails
  if (allowedEmails.length === 0) {
    logger.info('No allowed emails configured, allowing all emails')
    return true
  }
  
  return allowedEmails.includes(email.toLowerCase().trim())
}

export function getAllowedEmails(): string[] {
  return process.env.ALLOWED_EMAILS?.split(',').map(e => e.trim()) || []
} 