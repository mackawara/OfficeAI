export function isEmailAllowed(email: string): boolean {
  const allowedEmails = process.env.ALLOWED_EMAILS?.split(',').map(e => e.trim()) || []
  
  // If no allowed emails are configured, allow all emails
  if (allowedEmails.length === 0) {
    return true
  }
  
  return allowedEmails.includes(email.toLowerCase())
}

export function getAllowedEmails(): string[] {
  return process.env.ALLOWED_EMAILS?.split(',').map(e => e.trim()) || []
} 