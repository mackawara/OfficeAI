import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'

// Document Schema
const DocumentSchema = new mongoose.Schema({
  originalText: String,
  wordUrl: String,
  pdfUrl: String,
  createdAt: { type: Date, default: Date.now },
})

const DocumentModel = mongoose.models.Document || mongoose.model('Document', DocumentSchema)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const document = await DocumentModel.findById(params.id)
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Extract base64 data from the stored URL
    const base64Data = document.wordUrl.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="document.docx"',
      },
    })
  } catch (error) {
    console.error('Error downloading Word document:', error)
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    )
  }
} 