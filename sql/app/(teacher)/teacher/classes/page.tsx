import { verifySession } from '@/lib/auth'
import { getClassesByTeacher } from '@/lib/queries/classes'
import Link from 'next/link'
import DeleteClassButton from '@/components/teacher/DeleteClassButton'

export default async function ClassesPage() {
  const session = await verifySession()
  const classes = await getClassesByTeacher(session.userId)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-blue-800">My Classes</h1>
        <Link
          href="/teacher/classes/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
        >
          + New Class
        </Link>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-16 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-gray-500 mb-4">No classes yet.</p>
          <Link href="/teacher/classes/new" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition">
            Create your first class
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(cls => (
            <div key={cls.id} className="bg-white border border-blue-100 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all flex flex-col gap-3">
              <Link href={`/teacher/classes/${cls.id}`} className="block flex-1">
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
              </Link>
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <Link
                  href={`/teacher/classes/${cls.id}`}
                  className="flex-1 text-center text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition"
                >
                  View
                </Link>
                <DeleteClassButton classId={cls.id} className="flex-1 text-xs" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
