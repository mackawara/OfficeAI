'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  Image as ImageIcon, 
  FileText, 
  Download, 
  Upload, 
  Settings,
  Clock,
  TrendingUp
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Dashboard() {
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

  // Show loading state while checking authentication or fetching documents
  if (status === 'loading' || loadingDocs) {
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

  // Calculate stats based on user's documents
  const documentsProcessed = documents.length
  // Assume each document is an image upload (if you want to track images separately, you need to store that info)
  const imagesUploaded = documents.length
  // For downloads, if you want to track, you need to store download events; for now, use documents as a proxy
  const downloads = documents.length

  const stats = [
    {
      name: 'Documents Processed',
      value: documentsProcessed.toString(),
      change: '', // You can implement change tracking if you store previous stats
      changeType: 'positive',
      icon: FileText
    },
    {
      name: 'Images Uploaded',
      value: imagesUploaded.toString(),
      change: '',
      changeType: 'positive',
      icon: Upload
    },
    {
      name: 'Downloads',
      value: downloads.toString(),
      change: '',
      changeType: 'positive',
      icon: Download
    }
  ]

  const quickActions = [
    {
      name: 'Image to Word',
      description: 'Convert scanned images to Word documents',
      href: '/image-to-word',
      icon: ImageIcon,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Documents',
      description: 'Manage your processed documents',
      href: '/documents',
      icon: FileText,
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600'
    },
    {
      name: 'Settings',
      description: 'Configure your account and preferences',
      href: '/settings',
      icon: Settings,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {session?.user?.name || 'User'}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your documents today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
                <div className="flex items-center">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.name}
                href={action.href}
                className="group relative bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-primary-300"
              >
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {action.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-lg ring-2 ring-transparent group-hover:ring-primary-200 transition-all duration-200" />
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <div className="card">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Image processed successfully</p>
                <p className="text-xs text-gray-500">document_2024_01_15.docx</p>
              </div>
              <div className="text-xs text-gray-500">2 hours ago</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Download className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Document downloaded</p>
                <p className="text-xs text-gray-500">report_final.pdf</p>
              </div>
              <div className="text-xs text-gray-500">1 day ago</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Upload className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New image uploaded</p>
                <p className="text-xs text-gray-500">scan_001.jpg</p>
              </div>
              <div className="text-xs text-gray-500">2 days ago</div>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Getting Started</h3>
          <p className="text-gray-600 mb-4">
            New to OfficeAI? Start by converting your first image to a Word document.
          </p>
          <Link
            href="/image-to-word"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Start Converting
          </Link>
        </div>
      </div>
    </div>
  )
} 