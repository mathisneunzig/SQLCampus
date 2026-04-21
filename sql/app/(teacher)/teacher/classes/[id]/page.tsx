import { notFound } from 'next/navigation'
import Link from 'next/link'
import { verifySession } from '@/lib/auth'
import { getClassById, getClassMembers } from '@/lib/queries/classes'
import { getClassProgress } from '@/lib/queries/progress'
import { pool } from '@/lib/db'

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await verifySession()
  const cls = await getClassById(parseInt(id, 10))

  if (!cls || cls.teacher_id !== session.userId) notFound()

  const [members, progress] = await Promise.all([
    getClassMembers(cls.id),
    getClassProgress(cls.id),
  ])

  // Get all exercises with their lesson info
  const [exerciseRows] = await pool.query(`
    SELECT e.id, e.title, e.type, l.title as lesson_title, l.slug as lesson_slug
    FROM exercises e
    JOIN lessons l ON l.id = e.lesson_id
    ORDER BY l.order_index, e.order_index
  `)
  const exercises = exerciseRows as { id: number; title: string; type: string; lesson_title: string; lesson_slug: string }[]

  // Build progress map: studentId -> Set<exerciseId>
  const progressMap = new Map<number, Set<number>>()
  for (const member of members) {
    progressMap.set(member.id, new Set())
  }
  for (const p of progress) {
    if (p.completed_at && p.exercise_id && progressMap.has(p.user_id)) {
      progressMap.get(p.user_id)!.add(p.exercise_id)
    }
  }

  const totalExercises = exercises.length

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/teacher/classes" className="hover:text-blue-600">Classes</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{cls.name}</span>
      </nav>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">{cls.name}</h1>
          <p className="text-gray-500 mt-1">
            Join code: <code className="bg-blue-50 px-2 py-0.5 rounded font-mono text-blue-700">{cls.join_code}</code>
            <span className="ml-4">{members.length} students</span>
          </p>
        </div>
        <Link
          href="/teacher/classes"
          className="text-sm text-gray-500 hover:text-blue-600 transition"
        >
          ← Back to Classes
        </Link>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-16 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-gray-500">No students in this class yet.</p>
          <p className="text-sm text-gray-400 mt-2">Share the join code <strong className="font-mono text-blue-600">{cls.join_code}</strong> with your students.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
          {/* Summary table: student x completion count */}
          <div className="p-6 border-b border-blue-50">
            <h2 className="font-semibold text-gray-900 mb-4">Student Progress Summary</h2>
            <div className="space-y-3">
              {members.map(member => {
                const completed = progressMap.get(member.id)?.size ?? 0
                const pct = totalExercises > 0 ? Math.round((completed / totalExercises) * 100) : 0
                return (
                  <div key={member.id} className="flex items-center gap-4">
                    <span className="w-40 text-sm font-mono text-gray-700 shrink-0 truncate">{member.username}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 shrink-0 w-24 text-right">
                      {completed}/{totalExercises} ({pct}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Detailed grid by lesson */}
          <div className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Detailed Progress by Exercise</h2>
            <div className="overflow-x-auto">
              <table className="text-xs w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left px-2 py-2 text-gray-600 font-medium w-40 sticky left-0 bg-white">Student</th>
                    {exercises.map(ex => (
                      <th
                        key={ex.id}
                        title={`${ex.lesson_title}: ${ex.title}`}
                        className="px-1 py-2 text-center"
                      >
                        <span
                          className={`text-xs font-bold ${
                            ex.type === 'sql' ? 'text-blue-500' :
                            ex.type === 'multiple_choice' ? 'text-purple-500' :
                            ex.type === 'single_choice' ? 'text-green-500' :
                            'text-orange-500'
                          }`}
                        >
                          {ex.type === 'sql' ? 'S' : ex.type === 'multiple_choice' ? 'M' : ex.type === 'single_choice' ? 'C' : 'F'}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, i) => (
                    <tr key={member.id} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}>
                      <td className="px-2 py-2 font-mono text-gray-700 sticky left-0 bg-inherit truncate max-w-40">{member.username}</td>
                      {exercises.map(ex => {
                        const done = progressMap.get(member.id)?.has(ex.id)
                        return (
                          <td key={ex.id} className="px-1 py-2 text-center">
                            {done ? (
                              <span className="text-green-500 font-bold">✓</span>
                            ) : (
                              <span className="text-gray-200">·</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-3">S = SQL · M = Multiple Choice · C = Single Choice · F = Fill in the Blank</p>
          </div>
        </div>
      )}
    </div>
  )
}
