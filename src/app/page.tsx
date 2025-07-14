'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Upload, FileText, Download, Image as ImageIcon } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import DocumentPreview from '@/components/DocumentPreview'
import Navigation from '@/components/Navigation'

export default function Home() {
  const { data: session, status } = useSession()
  const [extractedTexts, setExtractedTexts] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedDocument, setProcessedDocument] = useState<{
    wordUrl?: string
    pdfUrl?: string
  }>({})

  // Persist uploads in sessionStorage
  useEffect(() => {
    if (extractedTexts.length > 0) {
      sessionStorage.setItem('officeai_uploads', JSON.stringify(extractedTexts))
    }
  }, [extractedTexts])

  useEffect(() => {
    const saved = sessionStorage.getItem('officeai_uploads')
    if (saved) {
      setExtractedTexts(JSON.parse(saved))
    }
  }, [])

  // Special marker for page breaks
  const PAGE_BREAK_MARKER = '__PAGE_BREAK__'

  const handleImageProcess = async (imageFile: File) => {
    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('image', imageFile)

      const response = await fetch('/api/process-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process image')
      }

      const data = await response.json()
      setExtractedTexts(prev => [...prev, data.text])
      setProcessedDocument({}) // Clear previous document links
    } catch (error) {
      console.error('Error processing image:', error)
      alert('Error processing image. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleInsertPageBreak = () => {
    setExtractedTexts(prev => [...prev, PAGE_BREAK_MARKER])
  }

  // Save only the last upload as a document
  const handleSaveSingle = async () => {
    if (extractedTexts.length === 0) return
    setIsProcessing(true)
    try {
      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extractedTexts: [extractedTexts[extractedTexts.length - 1]],
          pageBreakMarker: PAGE_BREAK_MARKER,
        }),
      })
      const data = await response.json()
      setProcessedDocument({
        wordUrl: data.wordUrl,
        pdfUrl: data.pdfUrl,
      })
    } catch (error) {
      alert('Error saving document. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Save all uploads as a single document
  const handleSaveAll = async () => {
    if (extractedTexts.length === 0) return
    setIsProcessing(true)
    try {
      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extractedTexts,
          pageBreakMarker: PAGE_BREAK_MARKER,
        }),
      })
      const data = await response.json()
      setProcessedDocument({
        wordUrl: data.wordUrl,
        pdfUrl: data.pdfUrl,
      })
    } catch (error) {
      alert('Error saving document. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Redirect to signin if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to OfficeAI</h1>
          <p className="text-gray-600 mb-8">Please sign in to access the application</p>
          <div className="space-x-4">
            <a href="/auth/signin" className="btn-primary">
              Sign In
            </a>
            <a href="/auth/signup" className="btn-secondary">
              Sign Up
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            OfficeAI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform scanned images into professional Word documents and PDFs using AI
          </p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="card">
          <div className="flex items-center mb-4">
            <ImageIcon className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Upload Image
            </h2>
          </div>
          <ImageUpload 
            onImageUpload={handleImageProcess}
            isProcessing={isProcessing}
          />
          <button
            className="mt-4 w-full btn-secondary"
            onClick={handleInsertPageBreak}
            disabled={isProcessing}
          >
            Insert Page Break
          </button>
        </div>

        {/* Preview Section */}
        <div className="card">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Document Preview
            </h2>
          </div>
          <DocumentPreview 
            extractedTexts={extractedTexts}
            processedDocument={processedDocument}
            isProcessing={isProcessing}
            pageBreakMarker={PAGE_BREAK_MARKER}
          />
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <button
            className="btn-primary"
            onClick={handleSaveSingle}
            disabled={isProcessing || extractedTexts.length === 0}
          >
            Save This Upload
          </button>
          <button
            className="btn-secondary"
            onClick={handleSaveAll}
            disabled={isProcessing || extractedTexts.length === 0}
          >
            Save All Uploads
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <Upload className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Easy Upload</h3>
            <p className="text-gray-600">
              Simply drag and drop or click to upload your scanned images
            </p>
          </div>
          <div className="card text-center">
            <FileText className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Processing</h3>
            <p className="text-gray-600">
              Advanced AI models extract and process text from your images
            </p>
          </div>
          <div className="card text-center">
            <Download className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Multiple Formats</h3>
            <p className="text-gray-600">
              Download your documents as Word files or PDFs
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  )
} 