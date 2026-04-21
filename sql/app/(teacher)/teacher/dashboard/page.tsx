import { verifySession } from '@/lib/auth'
import { getClassesByTeacher } from '@/lib/queries/classes'
import { getTotalExerciseCount } from '@/lib/queries/lessons'
import Link from 'next/link'

export default async function TeacherDashboard() {
  const session = await verifySession()
  const [classes, totalExercises] = await Promise.all([
    getClassesByTeacher(session.userId),
    getTotalExerciseCount(),
  ])

  const totalStudents = classes.reduce((sum, c) => sum + c.student_count, 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-blue-800">Teacher Dashboard</h1>
        <Link
          href="/teacher/classes/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
        >
          + New Class
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-xl border border-blue-100 p-5 text-center shadow-sm">
          <div className="text-3xl font-bold text-blue-600">{classes.length}</div>
          <div className="text-sm text-gray-500 mt-1">Classes</div>
        </div>
        <div className="bg-white rounded-xl border border-blue-100 p-5 text-center shadow-sm">
          <div className="text-3xl font-bold text-blue-600">{totalStudents}</div>
          <div className="text-sm text-gray-500 mt-1">Students</div>
        </div>
        <div className="bg-white rounded-xl border border-blue-100 p-5 text-center shadow-sm">
          <div className="text-3xl font-bold text-blue-600">{totalExercises}</div>
          <div className="text-sm text-gray-500 mt-1">Exercises Available</div>
        </div>
      </div>

      {/* Classes */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">My Classes</h2>

      {classes.length === 0 ? (
        <div className="text-center py-12 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-gray-500 mb-4">No classes yet. Create your first class!</p>
          <Link href="/teacher/classes/new" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition">
            Create Class
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {classes.map(cls => (
            <Link key={cls.id} href={`/teacher/classes/${cls.id}`} className="block">
              <div className="bg-white border border-blue-100 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-mono">
                    {cls.join_code}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{cls.student_count} students</p>
                <p className="text-xs text-gray-400 mt-1">
                  Created {new Date(cls.created_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
