'use client'

import { FileText, Download, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface DocumentPreviewProps {
  extractedText: string
  processedDocument: {
    wordUrl?: string
    pdfUrl?: string
  }
  isProcessing: boolean
}

export default function DocumentPreview({ 
  extractedText, 
  processedDocument, 
  isProcessing 
}: DocumentPreviewProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(extractedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  const downloadDocument = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Failed to download document:', error)
    }
  }

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing document...</p>
        </div>
      </div>
    )
  }

  if (!extractedText) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Upload an image to see the extracted text here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Extracted Text */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Extracted Text</h3>
          <button
            onClick={copyToClipboard}
            className="flex items-center text-sm text-primary-600 hover:text-primary-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </>
            )}
          </button>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
          <p className="text-gray-800 whitespace-pre-wrap text-sm">
            {extractedText}
          </p>
        </div>
      </div>

      {/* Download Options */}
      {(processedDocument.wordUrl || processedDocument.pdfUrl) && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Download Documents</h3>
          <div className="space-y-2">
            {processedDocument.wordUrl && (
              <button
                onClick={() => downloadDocument(processedDocument.wordUrl!, 'document.docx')}
                className="w-full flex items-center justify-center btn-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Word Document
              </button>
            )}
            {processedDocument.pdfUrl && (
              <button
                onClick={() => downloadDocument(processedDocument.pdfUrl!, 'document.pdf')}
                className="w-full flex items-center justify-center btn-secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 