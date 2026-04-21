'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteClassButtonProps {
  classId: number
  className?: string
}

export default function DeleteClassButton({ classId, className = '' }: DeleteClassButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const res = await fetch(`/api/classes/${classId}`, { method: 'DELETE' })
    setLoading(false)
    setConfirming(false)
    if (res.ok) {
      router.refresh()
    }
  }

  if (confirming) {
    return (
      <div className={`flex gap-1 ${className}`}>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex-1 text-xs bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-2 py-1.5 rounded-lg transition"
        >
          {loading ? '...' : 'Confirm'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1.5 rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className={`text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition ${className}`}
    >
      Delete
    </button>
  )
}
