'use client'
import { useState } from 'react'

interface SingleChoiceProps {
  exerciseId: number
  options: string[]
  description: string
  initialCompleted?: boolean
}

export default function SingleChoice({ exerciseId, options, description, initialCompleted = false }: SingleChoiceProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (selected === null) return
    setLoading(true)
    const res = await fetch(`/api/exercises/${exerciseId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer: selected }),
    })
    const data = await res.json()
    setFeedback(data.correct ? 'correct' : 'incorrect')
    setLoading(false)
  }

  const done = feedback === 'correct' || initialCompleted

  return (
    <div className="space-y-3">
      <p className="text-gray-700 text-sm">{description}</p>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <label
            key={i}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
              selected === i
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
            } ${done ? 'pointer-events-none' : ''}`}
          >
            <input
              type="radio"
              name={`sc-${exerciseId}`}
              checked={selected === i}
              onChange={() => setSelected(i)}
              disabled={!!done}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-800">{opt}</span>
          </label>
        ))}
      </div>
      {!done && (
        <button
          onClick={submit}
          disabled={selected === null || loading}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm rounded-lg transition font-medium"
        >
          {loading ? 'Checking...' : 'Submit'}
        </button>
      )}
      {feedback === 'correct' && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-lg font-medium">
          Correct!
        </p>
      )}
      {feedback === 'incorrect' && (
        <p className="text-sm text-orange-700 bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg">
          That&apos;s not right. Try again!
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
