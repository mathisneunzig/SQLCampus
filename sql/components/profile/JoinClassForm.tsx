'use client'
import { useState } from 'react'

export default function JoinClassForm() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const res = await fetch('/api/classes/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ joinCode: code }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Failed to join class')
    } else {
      setSuccess(`Joined class: ${data.className}`)
      setCode('')
    }
  }

  return (
    <div className="bg-white rounded-xl border border-blue-100 p-5 shadow-sm">
      <h2 className="font-semibold text-gray-900 mb-3">Join a Class</h2>
      <p className="text-sm text-gray-500 mb-4">Enter the join code provided by your teacher.</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. ABC123"
          maxLength={10}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-900 font-mono uppercase text-sm"
          spellCheck={false}
        />
        <button
          type="submit"
          disabled={loading || code.trim().length < 4}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition"
        >
          {loading ? 'Joining...' : 'Join'}
        </button>
      </form>
      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-lg mt-3">
          {success}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-lg mt-3">
          {error}
        </p>
      )}
    </div>
  )
}
