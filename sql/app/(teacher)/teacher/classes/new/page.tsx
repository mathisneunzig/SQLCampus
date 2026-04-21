'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Credential {
  username: string
  password: string
}

export default function NewClassPage() {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'credentials'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [classId, setClassId] = useState<number | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [className, setClassName] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const count = parseInt(formData.get('count') as string, 10)

    setClassName(name)

    const res = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, studentCount: count }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Failed to create class')
      setLoading(false)
      return
    }

    setCredentials(data.credentials)
    setClassId(data.classId)
    setJoinCode(data.joinCode)
    setStep('credentials')
    setLoading(false)
  }

  function copyAll() {
    const text = credentials.map(c => `${c.username}\t${c.password}`).join('\n')
    navigator.clipboard.writeText('Username\tPassword\n' + text)
  }

  function downloadCsv() {
    const csv = 'Username,Password\n' + credentials.map(c => `${c.username},${c.password}`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${className}-credentials.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (step === 'credentials') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-green-800 mb-1">Class created successfully!</h2>
          <p className="text-green-700 text-sm">
            Class <strong>{className}</strong> · Join code: <code className="bg-green-100 px-2 py-0.5 rounded font-mono">{joinCode}</code>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-blue-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Student Credentials</h3>
            <div className="flex gap-2">
              <button
                onClick={copyAll}
                className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition"
              >
                Copy all
              </button>
              <button
                onClick={downloadCsv}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition"
              >
                Download CSV
              </button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4 text-sm text-amber-800">
            Save these credentials now — passwords will not be shown again!
          </div>

          <div className="overflow-auto max-h-96 rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-blue-600 text-white sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Username</th>
                  <th className="px-4 py-2 text-left">Password</th>
                </tr>
              </thead>
              <tbody>
                {credentials.map((cred, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                    <td className="px-4 py-2 text-gray-400 font-mono">{i + 1}</td>
                    <td className="px-4 py-2 font-mono text-gray-900">{cred.username}</td>
                    <td className="px-4 py-2 font-mono text-gray-700">{cred.password}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex gap-3">
            <Link
              href={`/teacher/classes/${classId}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
            >
              View Class
            </Link>
            <Link
              href="/teacher/classes"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium transition"
            >
              All Classes
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/teacher/classes" className="hover:text-blue-600">Classes</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">New Class</span>
      </nav>

      <h1 className="text-3xl font-bold text-blue-800 mb-8">Create a New Class</h1>

      <div className="bg-white rounded-2xl border border-blue-100 p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Class Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={80}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-900"
              placeholder="e.g. Database Fundamentals 2025"
            />
          </div>

          <div>
            <label htmlFor="count" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Students
            </label>
            <input
              id="count"
              name="count"
              type="number"
              required
              min={1}
              max={500}
              defaultValue={20}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              Student accounts will be auto-generated. You can share the credentials with your students.
            </p>
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 px-4 rounded-lg transition"
          >
            {loading ? 'Creating...' : 'Create Class'}
          </button>
        </form>
      </div>
    </div>
  )
}
