import Link from 'next/link'
import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/auth'
import { getAllLessons, getTotalExerciseCount, getExerciseCountsByLesson } from '@/lib/queries/lessons'
import LessonCard from '@/components/lessons/LessonCard'
import { getCompletedExerciseIds, getCompletedCountsByLesson } from '@/lib/queries/progress'

const FEATURE_CARDS = [
  {
    icon: '📚',
    title: '20 Lessons',
    desc: 'From SELECT basics to advanced subqueries — step by step.',
  },
  {
    icon: '⌨️',
    title: 'Interactive SQL Editor',
    desc: 'Run SQL queries right in your browser and see instant results.',
  },
  {
    icon: '✅',
    title: '4 Exercise Types',
    desc: 'SQL, multiple choice, single choice, and fill-in-the-blank.',
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    desc: "See exactly which exercises you've completed.",
  },
]

export default async function HomePage() {
  const session = await verifySession()

  // Redirect teachers to their dashboard
  if (session.role === 'teacher') {
    redirect('/teacher/dashboard')
  }

  const [lessons, totalExercises, completedIds, countMap, completedByLesson] = await Promise.all([
    getAllLessons(),
    getTotalExerciseCount(),
    getCompletedExerciseIds(session.userId),
    getExerciseCountsByLesson(),
    getCompletedCountsByLesson(session.userId),
  ])

  const recentLessons = lessons.slice(0, 6)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Learn SQL, step by step
          </h1>
          <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">
            Master SQL with interactive tutorials, hands-on exercises, and instant feedback.
            From SELECT basics to advanced JOINs and subqueries.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/learn"
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-3 rounded-xl text-sm transition shadow"
            >
              Start Learning
            </Link>
            <Link
              href="/profile"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl text-sm transition border border-blue-400"
            >
              My Progress
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-blue-600 text-white py-4 px-4">
        <div className="max-w-4xl mx-auto flex justify-center gap-12 text-center">
          <div>
            <div className="text-2xl font-bold">{lessons.length}</div>
            <div className="text-blue-200 text-xs">Lessons</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{totalExercises}</div>
            <div className="text-blue-200 text-xs">Exercises</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{completedIds.size}</div>
            <div className="text-blue-200 text-xs">Completed by you</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {FEATURE_CARDS.map(f => (
              <div key={f.title} className="bg-white rounded-xl border border-blue-100 p-5 text-center shadow-sm">
                <div className="text-3xl mb-2">{f.icon}</div>
                <div className="font-semibold text-gray-900 text-sm mb-1">{f.title}</div>
                <div className="text-gray-500 text-xs">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent lessons */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-blue-800">Start Learning</h2>
            <Link href="/learn" className="text-sm text-blue-600 hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentLessons.map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                completedCount={completedByLesson[lesson.id] ?? 0}
                totalExercises={countMap[lesson.id] ?? 0}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
