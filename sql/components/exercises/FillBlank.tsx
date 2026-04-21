'use client'
import { useState } from 'react'

interface FillBlankProps {
  exerciseId: number
  template: string
  hint?: string
  description: string
  initialCompleted?: boolean
}

export default function FillBlank({ exerciseId, template, hint, description, initialCompleted = false }: FillBlankProps) {
  const parts = template.split('___')
  const [values, setValues] = useState<string[]>(Array(parts.length - 1).fill(''))
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [loading, setLoading] = useState(false)

  function update(i: number, val: string) {
    setValues(prev => prev.map((v, idx) => (idx === i ? val : v)))
  }

  async function submit() {
    setLoading(true)
    const res = await fetch(`/api/exercises/${exerciseId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer: values }),
    })
    const data = await res.json()
    setFeedback(data.correct ? 'correct' : 'incorrect')
    setLoading(false)
  }

  const done = feedback === 'correct' || initialCompleted

  return (
    <div className="space-y-3">
      <p className="text-gray-700 text-sm">{description}</p>

      <div className="bg-gray-900 text-green-300 font-mono text-sm p-4 rounded-lg flex flex-wrap items-center gap-1">
        {parts.map((part, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="whitespace-pre">{part}</span>
            {i < parts.length - 1 && (
              <input
                type="text"
                value={values[i]}
                onChange={e => update(i, e.target.value)}
                disabled={!!done}
                className="bg-transparent border-b-2 border-blue-400 text-blue-300 outline-none w-24 text-center px-1"
                placeholder="___"
                spellCheck={false}
              />
            )}
          </span>
        ))}
      </div>

      {hint && (
        <p className="text-xs text-gray-500 italic">Hint: {hint}</p>
      )}

      {!done && (
        <button
          onClick={submit}
          disabled={values.some(v => !v.trim()) || loading}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm rounded-lg transition font-medium"
        >
          {loading ? 'Checking...' : 'Submit'}
        </button>
      )}

      {feedback === 'correct' && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-lg font-medium">
          Correct! Great job!
        </p>
      )}
      {feedback === 'incorrect' && (
        <p className="text-sm text-orange-700 bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg">
          Not quite right. Check the blanks and try again!
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
