import { NextRequest, NextResponse } from 'next/server'
import { getAllowedEmails } from '@/lib/emailValidation'

export async function GET(request: NextRequest) {
  try {
    const allowedEmails = getAllowedEmails()
    
    return NextResponse.json({
      allowedEmails,
      totalCount: allowedEmails.length
    })
  } catch (error) {
    console.error('Error fetching allowed emails:', error)
    return NextResponse.json(
      { error: 'Failed to fetch allowed emails' },
      { status: 500 }
    )
  }
} 