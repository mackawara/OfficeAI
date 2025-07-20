'use client'

import { useSession } from 'next-auth/react'
import { Settings as SettingsIcon, User, Bell, Shield, Palette } from 'lucide-react'

export default function Settings() {
  const { data: session, status } = useSession()

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

  const settingsSections = [
    {
      title: 'Account Settings',
      icon: User,
      items: [
        { name: 'Profile Information', description: 'Update your name and email' },
        { name: 'Password', description: 'Change your account password' },
        { name: 'Account Preferences', description: 'Manage your account settings' }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { name: 'Email Notifications', description: 'Configure email alerts' },
        { name: 'Processing Updates', description: 'Get notified when documents are ready' },
        { name: 'System Alerts', description: 'Receive system maintenance notifications' }
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      items: [
        { name: 'Two-Factor Authentication', description: 'Add an extra layer of security' },
        { name: 'Session Management', description: 'Manage active sessions' },
        { name: 'Privacy Settings', description: 'Control your data privacy' }
      ]
    },
    {
      title: 'Appearance',
      icon: Palette,
      items: [
        { name: 'Theme', description: 'Choose light or dark mode' },
        { name: 'Language', description: 'Select your preferred language' },
        { name: 'Display Settings', description: 'Customize the interface' }
      ]
    }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account preferences and application settings.
        </p>
      </div>

      <div className="space-y-6">
        {settingsSections.map((section) => {
          const Icon = section.icon
          return (
            <div key={section.title} className="card">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
              </div>
              
              <div className="space-y-4">
                {section.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                      Configure
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Account Information */}
      <div className="card mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Name</h3>
              <p className="text-sm text-gray-500">{session?.user?.name || 'Not set'}</p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
              Edit
            </button>
          </div>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Email</h3>
              <p className="text-sm text-gray-500">{session?.user?.email}</p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 