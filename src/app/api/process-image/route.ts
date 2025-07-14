import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Document Schema
const DocumentSchema = new mongoose.Schema({
  originalText: String,
  wordUrl: String,
  pdfUrl: String,
  createdAt: { type: Date, default: Date.now },
})

const DocumentModel = mongoose.models.Document || mongoose.model('Document', DocumentSchema)

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const contentType = request.headers.get('content-type') || '';
    let extractedTexts: string[] | null = null;
    let pageBreakMarker: string | null = null;

    if (contentType.includes('application/json')) {
      const json = await request.json();
      if (Array.isArray(json.extractedTexts)) {
        extractedTexts = json.extractedTexts;
        pageBreakMarker = json.pageBreakMarker || '__PAGE_BREAK__';
      }
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const imageFile = formData.get('image') as File;
      if (!imageFile) {
        return NextResponse.json(
          { error: 'No image file provided' },
          { status: 400 }
        );
      }
      // Convert image to base64
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = buffer.toString('base64');
      // Use OpenAI Vision API to extract text
      const visionResponse = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please extract all the text from this image. Return only the text content, maintaining the original formatting and structure. If there are tables, preserve the table structure. If there are lists, maintain the list format. Maintain the  original text pargrabphs by inserting double new lines"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${imageFile.type};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
      });
      const extractedText = visionResponse.choices[0]?.message?.content || '';
      extractedTexts = [extractedText];
      pageBreakMarker = '__PAGE_BREAK__';
    } else {
      return NextResponse.json(
        { error: 'Unsupported content type' },
        { status: 400 }
      );
    }

    // Now, extractedTexts is an array of blocks, and pageBreakMarker is set
    // Build paragraphs and handle page breaks for Word
    const { Document, Packer, Paragraph, TextRun } = await import('docx')
    const docSections: any[] = []
    let currentSection: any[] = []
    for (const block of extractedTexts!) {
      if (block === pageBreakMarker) {
        if (currentSection.length > 0) {
          docSections.push({
            properties: {},
            children: currentSection,
          })
          currentSection = []
        }
      } else {
        // Split block into paragraphs
        const paragraphs = block
          .split(/\n\s*\n/)
          .map(p => p.trim())
          .filter(p => p.length > 0)
          .map(paragraphText =>
            new Paragraph({
              children: [
                new TextRun({
                  text: paragraphText,
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
            })
          )
        currentSection.push(...paragraphs)
      }
    }
    if (currentSection.length > 0) {
      docSections.push({
        properties: {},
        children: currentSection,
      })
    }
    const doc = new Document({ sections: docSections })
    const wordBuffer = await Packer.toBuffer(doc)
    const wordBase64 = wordBuffer.toString('base64')

    // PDF generation
    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib')
    const pdfDoc = await PDFDocument.create()
    let page = pdfDoc.addPage()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    let yPosition = page.getHeight() - 50
    for (const block of extractedTexts!) {
      if (block === pageBreakMarker) {
        page = pdfDoc.addPage()
        yPosition = page.getHeight() - 50
        continue
      }
      const paragraphs = block
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0)
      for (const paragraph of paragraphs) {
        const cleanParagraph = paragraph.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
        const words = cleanParagraph.split(' ')
        let currentLine = ''
        const maxWidth = page.getWidth() - 100
        const lineHeight = 16
        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word
          const textWidth = font.widthOfTextAtSize(testLine, 12)
          if (textWidth > maxWidth && currentLine) {
            if (yPosition < 50) {
              page = pdfDoc.addPage()
              yPosition = page.getHeight() - 50
            }
            page.drawText(currentLine, {
              x: 50,
              y: yPosition,
              size: 12,
              font: font,
              color: rgb(0, 0, 0),
            })
            yPosition -= lineHeight
            currentLine = word
          } else {
            currentLine = testLine
          }
        }
        if (currentLine) {
          if (yPosition < 50) {
            page = pdfDoc.addPage()
            yPosition = page.getHeight() - 50
          }
          page.drawText(currentLine, {
            x: 50,
            y: yPosition,
            size: 12,
            font: font,
            color: rgb(0, 0, 0),
          })
          yPosition -= lineHeight
        }
        yPosition -= 10
      }
      yPosition -= 10
    }
    const pdfBytes = await pdfDoc.save()
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64')

    // Save to database
    const document = new DocumentModel({
      originalText: extractedTexts!.join('\n\n'),
      wordUrl: `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${wordBase64}`,
      pdfUrl: `data:application/pdf;base64,${pdfBase64}`,
    })
    await document.save()

    return NextResponse.json({
      text: extractedTexts!.join('\n\n'),
      wordUrl: `/api/download/word/${document._id}`,
      pdfUrl: `/api/download/pdf/${document._id}`,
    })
  } catch (error) {
    console.error('Error processing image:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    )
  }
} 