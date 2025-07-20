'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Mail, Clock, Shield } from 'lucide-react'
import Link from 'next/link'

interface AdminData {
  allowedEmails: string[]
  totalCount: number
  rateLimitConfig: {
    maxRequests: number
    windowMs: number
  }
}

export default function AdminPage() {
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch('/api/admin/allowed-emails')
        if (response.ok) {
          const data = await response.json()
          setAdminData({
            ...data,
            rateLimitConfig: {
              maxRequests: parseInt(process.env.NEXT_PUBLIC_RATE_LIMIT_MAX_REQUESTS || '5'),
              windowMs: parseInt(process.env.NEXT_PUBLIC_RATE_LIMIT_WINDOW_MS || '900000')
            }
          })
        } else {
          setError('Failed to fetch admin data')
        }
      } catch (error) {
        setError('An error occurred while fetching admin data')
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading admin data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <Link href="/" className="mt-4 inline-block text-primary-600 hover:text-primary-500">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Allowed Emails Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Mail className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Allowed Emails</h2>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Total allowed emails: <span className="font-semibold">{adminData?.totalCount || 0}</span>
              </p>
            </div>

            {adminData?.allowedEmails && adminData.allowedEmails.length > 0 ? (
              <div className="space-y-2">
                {adminData.allowedEmails.map((email, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-700">{email}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No allowed emails configured</p>
                <p className="text-xs text-gray-400 mt-1">
                  All emails are currently allowed for signup
                </p>
              </div>
            )}
          </div>

          {/* Rate Limiting Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Rate Limiting</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">Max Requests</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {adminData?.rateLimitConfig.maxRequests || 5}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">Window Duration</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {Math.round((adminData?.rateLimitConfig.windowMs || 900000) / 1000 / 60)} minutes
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-xs text-blue-700">
                Rate limiting is applied per IP address to prevent abuse of the signup endpoint.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              • Rate limiting and email allowlist are configured via environment variables
            </p>
            <p>
              • To modify allowed emails, update the <code className="bg-gray-100 px-1 rounded">ALLOWED_EMAILS</code> environment variable
            </p>
            <p>
              • To adjust rate limiting, update <code className="bg-gray-100 px-1 rounded">RATE_LIMIT_MAX_REQUESTS</code> and <code className="bg-gray-100 px-1 rounded">RATE_LIMIT_WINDOW_MS</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 