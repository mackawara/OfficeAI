'use client'

import { useSession } from 'next-auth/react'
import { FileText, Download, Trash2, Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Documents() {
  const { data: session, status } = useSession()
  const [documents, setDocuments] = useState<any[]>([])
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      setLoadingDocs(true)
      fetch('/api/documents')
        .then(res => res.json())
        .then(data => {
          setDocuments(data.documents || [])
          setLoadingDocs(false)
        })
        .catch(() => {
          setError('Failed to load documents')
          setLoadingDocs(false)
        })
    }
  }, [status])

  if (status === 'loading' || loadingDocs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents</h1>
        <p className="text-gray-600">
          Manage your processed documents and downloads.
        </p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Documents</h2>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Filter
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
              Upload New
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{doc.wordUrl ? 'Word Document' : doc.pdfUrl ? 'PDF Document' : 'Document'}</h3>
                  <p className="text-sm text-gray-500">{doc.originalText?.slice(0, 40)}...</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}
                </div>
                <a href={doc.wordUrl ? `/api/download/word/${doc._id}` : doc.pdfUrl ? `/api/download/pdf/${doc._id}` : '#'} className="p-2 text-gray-400 hover:text-primary-600 transition-colors" download>
                  <Download className="w-4 h-4" />
                </a>
                <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {documents.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-500 mb-4">
              Start by converting your first image to a document.
            </p>
            <a
              href="/image-to-word"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Convert Image
            </a>
          </div>
        )}
      </div>
    </div>
  )
} 