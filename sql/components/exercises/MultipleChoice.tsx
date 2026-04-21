'use client'
import { useState } from 'react'

interface MultipleChoiceProps {
  exerciseId: number
  options: string[]
  description: string
  initialCompleted?: boolean
}

export default function MultipleChoice({ exerciseId, options, description, initialCompleted = false }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [loading, setLoading] = useState(false)

  function toggle(i: number) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  async function submit() {
    if (selected.size === 0) return
    setLoading(true)
    const res = await fetch(`/api/exercises/${exerciseId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer: Array.from(selected) }),
    })
    const data = await res.json()
    setFeedback(data.correct ? 'correct' : 'incorrect')
    setLoading(false)
  }

  const done = feedback === 'correct' || initialCompleted

  return (
    <div className="space-y-3">
      <p className="text-gray-700 text-sm">{description}</p>
      <p className="text-xs text-gray-500">Select all that apply.</p>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <label
            key={i}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
              selected.has(i)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
            } ${done ? 'pointer-events-none' : ''}`}
          >
            <input
              type="checkbox"
              checked={selected.has(i)}
              onChange={() => toggle(i)}
              disabled={!!done}
              className="text-blue-600 rounded"
            />
            <span className="text-sm text-gray-800">{opt}</span>
          </label>
        ))}
      </div>
      {!done && (
        <button
          onClick={submit}
          disabled={selected.size === 0 || loading}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm rounded-lg transition font-medium"
        >
          {loading ? 'Checking...' : 'Submit'}
        </button>
      )}
      {feedback === 'correct' && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-lg font-medium">
          Correct! All right answers selected.
        </p>
      )}
      {feedback === 'incorrect' && (
        <p className="text-sm text-orange-700 bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg">
          Not quite right. Try again!
        </p>
      )}
      {initialCompleted && !feedback && (
        <p className="text-sm text-blue-600 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
          Already completed.
        </p>
      )}
    </div>
  )
}
