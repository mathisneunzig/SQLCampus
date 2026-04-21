import Link from 'next/link'
import type { Lesson } from '@/lib/queries/lessons'

const CATEGORY_COLORS: Record<string, string> = {
  Basics: 'bg-blue-100 text-blue-700',
  Manipulation: 'bg-green-100 text-green-700',
  Schema: 'bg-purple-100 text-purple-700',
  Joins: 'bg-orange-100 text-orange-700',
  Aggregates: 'bg-yellow-100 text-yellow-700',
  Advanced: 'bg-red-100 text-red-700',
}

interface LessonCardProps {
  lesson: Lesson
  completedCount?: number
  totalExercises?: number
}

export default function LessonCard({ lesson, completedCount = 0, totalExercises = 0 }: LessonCardProps) {
  const badgeClass = CATEGORY_COLORS[lesson.category] ?? 'bg-gray-100 text-gray-700'
  const pct = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0

  return (
    <Link href={`/learn/${lesson.slug}`} className="block group">
      <div className="bg-white border border-blue-100 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition leading-tight">
            {lesson.title}
          </h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${badgeClass}`}>
            {lesson.category}
          </span>
        </div>
        {totalExercises > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{completedCount}/{totalExercises} exercises</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
