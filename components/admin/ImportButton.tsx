'use client'

import { useState } from 'react'

interface Props {
  secret: string
}

export default function ImportButton({ secret }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleImport() {
    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch(`/api/import?secret=${encodeURIComponent(secret)}`, {
        method: 'POST',
      })
      const data = await res.json() as { error?: string; postsCount?: number; notesCount?: number }

      if (!res.ok) {
        setStatus('error')
        setMessage(data.error ?? 'Import failed')
        return
      }

      setStatus('success')
      setMessage(`Imported ${data.postsCount ?? 0} posts and ${data.notesCount ?? 0} notes.`)
    } catch {
      setStatus('error')
      setMessage('Network error')
    }
  }

  return (
    <div>
      <button
        onClick={handleImport}
        disabled={status === 'loading'}
        className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {status === 'loading' ? 'Importing...' : 'Import from Notion'}
      </button>
      {message && (
        <p className={`mt-2 text-sm ${status === 'error' ? 'text-red-600' : 'text-green-700'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
