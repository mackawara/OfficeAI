'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Image as ImageIcon, Download, Wand2, Loader2 } from 'lucide-react'

export default function TextToImagePage() {
  const { status } = useSession()

  const [prompt, setPrompt] = useState('')
  const [refineOpen, setRefineOpen] = useState(false)
  const [refinePrompt, setRefinePrompt] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [responseId, setResponseId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const callGenerate = async (p: string, prevId?: string | null) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: p, responseId: prevId ?? undefined }),
      })

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}))
        throw new Error(msg?.error || 'Failed to generate image')
      }

      const data: { dataUrl?: string; responseId?: string } = await res.json()
      if (!data?.dataUrl) throw new Error('No image returned')

      setImageDataUrl(data.dataUrl)
      setResponseId(data.responseId ?? null)
    } catch (e: any) {
      setError(e?.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const onGenerate = async () => {
    if (!prompt.trim()) return
    await callGenerate(prompt.trim())
  }

  const onEnhance = async () => {
    if (!refinePrompt.trim()) return
    await callGenerate(refinePrompt.trim(), responseId)
  }

  const handleDownload = () => {
    if (!imageDataUrl) return
    const link = document.createElement('a')
    link.href = imageDataUrl
    link.download = 'officeai-image.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Loading auth state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
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
            <a href="/auth/signin" className="btn-primary">Sign In</a>
            <a href="/auth/signup" className="btn-secondary">Sign Up</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Text to Image</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Generate stunning images from your text prompts using AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prompt Section */}
        <div className="card">
          <div className="flex items-center mb-4">
            <ImageIcon className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900">Enter Prompt</h2>
          </div>

          <textarea
            className="w-full rounded-md border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-primary-600 min-h-[140px]"
            placeholder="e.g., A cozy cabin in the woods at sunrise, cinematic lighting, ultra-detailed"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />

          <button
            className="btn-primary mt-4 w-full flex items-center justify-center gap-2 disabled:opacity-70"
            onClick={onGenerate}
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Generate Image
          </button>

          {error ? (
            <p className="text-red-600 text-sm mt-3">{error}</p>
          ) : null}

          {/* Enhance Toggle */}
          <div className="mt-6">
            <button
              className="btn-secondary w-full flex items-center justify-center gap-2"
              onClick={() => setRefineOpen((v) => !v)}
              disabled={isLoading || !imageDataUrl}
            >
              <Wand2 className="w-4 h-4" />
              {refineOpen ? 'Close Enhance' : 'Enhance'}
            </button>
            {refineOpen && (
              <div className="mt-3">
                <textarea
                  className="w-full rounded-md border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-primary-600 min-h-[100px]"
                  placeholder="Describe refinements, e.g., make it more vibrant, add soft bokeh, adjust composition..."
                  value={refinePrompt}
                  onChange={(e) => setRefinePrompt(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  className="btn-primary mt-3 w-full flex items-center justify-center gap-2 disabled:opacity-70"
                  onClick={onEnhance}
                  disabled={isLoading || !refinePrompt.trim() || !responseId}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Apply Enhancements
                </button>
                {!responseId && imageDataUrl ? (
                  <p className="text-xs text-gray-500 mt-2">
                    Generate at least once before enhancing.
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Preview Section */}
        <div className="card">
          <div className="flex items-center mb-4">
            <ImageIcon className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900">Preview</h2>
          </div>

          <div className="aspect-square w-full bg-gray-50 border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
            {imageDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageDataUrl} alt="Generated" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center text-gray-500 p-6">
                <p className="mb-1 font-medium">No image yet</p>
                <p className="text-sm">Enter a prompt and generate to see a preview</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70"
              onClick={handleDownload}
              disabled={!imageDataUrl}
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <h3 className="text-lg font-semibold mb-2">Be specific</h3>
            <p className="text-gray-600">Include style, lighting, lens, and mood for better results.</p>
          </div>
          <div className="card text-center">
            <h3 className="text-lg font-semibold mb-2">Iterate</h3>
            <p className="text-gray-600">Use Enhance to refine your image without starting over.</p>
          </div>
          <div className="card text-center">
            <h3 className="text-lg font-semibold mb-2">Quality</h3>
            <p className="text-gray-600">Download your image when you're satisfied with the preview.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

