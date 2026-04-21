import { verifySession } from '@/lib/auth'
import { getUserById } from '@/lib/queries/users'
import { getUserProgress } from '@/lib/queries/progress'
import { getAllLessons, getTotalExerciseCount, getExerciseCountsByLesson } from '@/lib/queries/lessons'
import { getCompletedCountsByLesson } from '@/lib/queries/progress'
import Link from 'next/link'
import JoinClassForm from '@/components/profile/JoinClassForm'

export default async function ProfilePage() {
  const session = await verifySession()
  const [user, progress, lessons, totalExercises, countMap, completedByLesson] = await Promise.all([
    getUserById(session.userId),
    getUserProgress(session.userId),
    getAllLessons(),
    getTotalExerciseCount(),
    getExerciseCountsByLesson(),
    getCompletedCountsByLesson(session.userId),
  ])

  const completedCount = progress.length

  // Group progress by lesson
  const byLesson: Record<string, typeof progress> = {}
  for (const p of progress) {
    if (!byLesson[p.lesson_slug]) byLesson[p.lesson_slug] = []
    byLesson[p.lesson_slug].push(p)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
          {user?.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
          <p className="text-sm text-blue-600 capitalize">{session.role}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-blue-100 p-5 text-center shadow-sm">
          <div className="text-3xl font-bold text-blue-600">{completedCount}</div>
          <div className="text-sm text-gray-500 mt-1">Completed</div>
        </div>
        <div className="bg-white rounded-xl border border-blue-100 p-5 text-center shadow-sm">
          <div className="text-3xl font-bold text-blue-600">{totalExercises}</div>
          <div className="text-sm text-gray-500 mt-1">Total Exercises</div>
        </div>
        <div className="bg-white rounded-xl border border-blue-100 p-5 text-center shadow-sm">
          <div className="text-3xl font-bold text-blue-600">
            {totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-500 mt-1">Completion</div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="bg-white rounded-xl border border-blue-100 p-5 mb-8 shadow-sm">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span>{completedCount} / {totalExercises}</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Join a class (students only) */}
      {session.role === 'student' && (
        <div className="mb-8">
          <JoinClassForm />
        </div>
      )}

      {/* Per-lesson progress */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress by Lesson</h2>

      {completedCount === 0 ? (
        <div className="text-center py-12 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-gray-500 mb-4">No exercises completed yet.</p>
          <Link href="/learn" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition">
            Start Learning
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map(lesson => {
            const lessonProgress = byLesson[lesson.slug] ?? []
            const lessonTotal = countMap[lesson.id] ?? 0
            if (lessonProgress.length === 0 && lessonTotal === 0) return null
            const pct = lessonTotal > 0 ? Math.round((lessonProgress.length / lessonTotal) * 100) : 0

            return (
              <Link key={lesson.id} href={`/learn/${lesson.slug}`} className="block">
                <div className="bg-white border border-blue-100 rounded-xl p-4 hover:border-blue-400 transition shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{lesson.title}</span>
                    <span className="text-sm text-gray-500">{lessonProgress.length}/{lessonTotal}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
