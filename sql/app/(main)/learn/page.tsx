import { getLessonsByCategory, getExerciseCountsByLesson } from '@/lib/queries/lessons'
import { verifySession } from '@/lib/auth'
import { getCompletedCountsByLesson } from '@/lib/queries/progress'
import LessonCard from '@/components/lessons/LessonCard'

export default async function LearnPage() {
  const session = await verifySession()
  const [grouped, countMap, completedByLesson] = await Promise.all([
    getLessonsByCategory(),
    getExerciseCountsByLesson(),
    getCompletedCountsByLesson(session.userId),
  ])

  const categories = Object.keys(grouped)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">SQL Tutorials</h1>
        <p className="text-gray-600">Learn SQL from scratch — step by step with interactive exercises.</p>
      </div>

      {categories.map(category => (
        <section key={category} className="mb-10">
          <h2 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded-full inline-block" />
            {category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped[category].map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                completedCount={completedByLesson[lesson.id] ?? 0}
                totalExercises={countMap[lesson.id] ?? 0}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
