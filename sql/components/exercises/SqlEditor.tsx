'use client'
import { useState, useEffect, useRef } from 'react'

interface SqlEditorProps {
  exerciseId: number
  setupSql: string
  description: string
  initialCompleted?: boolean
}

interface QueryResult {
  columns: string[]
  rows: unknown[][]
}

export default function SqlEditor({ exerciseId, setupSql, description, initialCompleted = false }: SqlEditorProps) {
  const [sql, setSql] = useState('')
  const [result, setResult] = useState<QueryResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [dbReady, setDbReady] = useState(false)
  const [completed, setCompleted] = useState(initialCompleted)
  const [feedback, setFeedback] = useState<string | null>(null)
  const dbRef = useRef<any>(null)

  useEffect(() => {
    async function initDb() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const initSqlJs = (await import(/* turbopackIgnore: true */ 'sql.js' as any)).default
        const SQL = await initSqlJs({ locateFile: () => '/sql-wasm.wasm' })
        const database = new SQL.Database()
        if (setupSql) {
          database.run(setupSql)
        }
        dbRef.current = database
        setDbReady(true)
      } catch (err) {
        setError('Failed to initialize SQL engine: ' + (err instanceof Error ? err.message : String(err)))
      }
    }
    initDb()
  }, [setupSql])

  function runQuery() {
    if (!dbRef.current || !sql.trim()) return
    setError(null)
    setResult(null)
    try {
      const results = dbRef.current.exec(sql)
      if (results.length === 0) {
        setResult({ columns: [], rows: [] })
      } else {
        const { columns, values } = results[0]
        setResult({ columns, rows: values })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query error')
    }
  }

  async function submitAnswer() {
    if (!sql.trim()) return
    setLoading(true)
    setFeedback(null)
    try {
      const res = await fetch(`/api/exercises/${exerciseId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: sql }),
      })
      const data = await res.json()
      if (data.correct) {
        setCompleted(true)
        setFeedback('correct')
      } else {
        setFeedback(data.error ? `Error: ${data.error}` : 'incorrect')
      }
    } catch {
      setFeedback('incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-gray-700 text-sm">{description}</p>

      {!dbReady && !error && (
        <div className="text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg animate-pulse">
          Loading SQL engine...
        </div>
      )}

      {dbReady && (
        <>
          <div className="relative">
            <textarea
              value={sql}
              onChange={e => setSql(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Tab') {
                  e.preventDefault()
                  const start = e.currentTarget.selectionStart
                  const end = e.currentTarget.selectionEnd
                  setSql(sql.substring(0, start) + '  ' + sql.substring(end))
                }
              }}
              className="w-full h-28 font-mono text-sm bg-gray-900 text-green-300 p-4 rounded-lg resize-none border border-gray-700 focus:border-blue-400 outline-none"
              placeholder="-- Write your SQL here..."
              spellCheck={false}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={runQuery}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition font-medium"
            >
              Run
            </button>
            <button
              onClick={submitAnswer}
              disabled={loading || completed}
              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded-lg transition font-medium"
            >
              {loading ? 'Checking...' : completed ? 'Completed!' : 'Submit'}
            </button>
          </div>

          {result && (
            <div className="overflow-x-auto rounded-lg border border-blue-100">
              {result.columns.length === 0 ? (
                <p className="text-sm text-gray-500 px-4 py-2">Query executed successfully (no results).</p>
              ) : (
                <table className="text-xs w-full">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      {result.columns.map((col, i) => (
                        <th key={i} className="px-3 py-1.5 text-left font-medium">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                        {(row as unknown[]).map((cell, j) => (
                          <td key={j} className="px-3 py-1.5 text-gray-700 font-mono">
                            {cell === null ? <span className="text-gray-400 italic">NULL</span> : String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-lg font-mono">
          {error}
        </div>
      )}

      {feedback === 'correct' && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-lg font-medium">
          Correct! Well done.
        </div>
      )}
      {feedback === 'incorrect' && (
        <div className="text-sm text-orange-700 bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg">
          Not quite right. Check the expected output and try again.
        </div>
      )}
      {feedback && feedback !== 'correct' && feedback !== 'incorrect' && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-2 rounded-lg font-mono">
          {feedback}
        </div>
      )}
    </div>
  )
}
