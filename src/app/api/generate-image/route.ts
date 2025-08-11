import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { rateLimit } from '@/lib/rateLimit'
import { openAiImageGeneration, openAiImageGenerationFollowUp } from '@/lib/textToImage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit by client IP
    const clientIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      // @ts-expect-error: NextRequest may include ip in some runtimes
      (request as any).ip ||
      'unknown'
    const rl = await rateLimit(request, clientIP)
    if (rl) return rl

    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const prompt: unknown = body?.prompt
    const previousResponseId: unknown = body?.responseId

    if (typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    let result:
      | { imageUrl: string | null; responseId: string | null }
      | undefined

    if (typeof previousResponseId === 'string' && previousResponseId.trim()) {
      result = await openAiImageGenerationFollowUp(prompt, previousResponseId)
    } else {
      result = await openAiImageGeneration(prompt)
    }

    const imageBase64 = result?.imageUrl || null
    const responseId = result?.responseId || null

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 502 }
      )
    }

    // Also return a data URL for easy preview in clients
    const dataUrl = `data:image/png;base64,${imageBase64}`

    return NextResponse.json(
      { imageBase64, dataUrl, responseId },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}