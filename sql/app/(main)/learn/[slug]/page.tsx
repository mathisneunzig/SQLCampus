import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getLessonWithExercises } from '@/lib/queries/lessons'
import { verifySession } from '@/lib/auth'
import { getCompletedExerciseIds } from '@/lib/queries/progress'
import LessonContent from '@/components/lessons/LessonContent'
import SingleChoice from '@/components/exercises/SingleChoice'
import MultipleChoice from '@/components/exercises/MultipleChoice'
import FillBlank from '@/components/exercises/FillBlank'
import SqlEditorClient from '@/components/exercises/SqlEditorClient'

const TYPE_LABELS: Record<string, string> = {
  sql: 'SQL Exercise',
  single_choice: 'Single Choice',
  multiple_choice: 'Multiple Choice',
  fill_blank: 'Fill in the Blank',
}

const TYPE_COLORS: Record<string, string> = {
  sql: 'bg-blue-100 text-blue-700',
  single_choice: 'bg-green-100 text-green-700',
  multiple_choice: 'bg-purple-100 text-purple-700',
  fill_blank: 'bg-orange-100 text-orange-700',
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [lesson, session] = await Promise.all([
    getLessonWithExercises(slug),
    verifySession(),
  ])
  if (!lesson) notFound()

  const completedIds = await getCompletedExerciseIds(session.userId)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/learn" className="hover:text-blue-600">Tutorials</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{lesson.title}</span>
      </nav>

      {/* Lesson header */}
      <h1 className="text-3xl font-bold text-blue-800 mb-8">{lesson.title}</h1>

      {/* Lesson content */}
      <div className="bg-white rounded-2xl border border-blue-100 p-8 mb-10 shadow-sm lesson-content">
        <LessonContent content={lesson.content_mdx} />
      </div>

      {/* Exercises */}
      {lesson.exercises.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-blue-800 mb-6 flex items-center gap-2">
            <span>Exercises</span>
            <span className="text-sm font-normal text-gray-500">
              ({completedIds.size > 0
                ? `${lesson.exercises.filter(e => completedIds.has(e.id)).length}/${lesson.exercises.length} completed`
                : `${lesson.exercises.length} total`})
            </span>
          </h2>

          <div className="space-y-6">
            {lesson.exercises.map((exercise, index) => {
              const config = JSON.parse(exercise.config_json)
              const isCompleted = completedIds.has(exercise.id)

              return (
                <div
                  key={exercise.id}
                  className={`bg-white rounded-2xl border p-6 shadow-sm ${
                    isCompleted ? 'border-green-200' : 'border-blue-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-500">
                          Exercise {index + 1}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[exercise.type]}`}>
                          {TYPE_LABELS[exercise.type]}
                        </span>
                        {isCompleted && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                            ✓ Done
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900">{exercise.title}</h3>
                    </div>
                  </div>

                  {exercise.type === 'sql' && (
                    <SqlEditorClient
                      exerciseId={exercise.id}
                      setupSql={config.setup_sql ?? ''}
                      description={exercise.description}
                      initialCompleted={isCompleted}
                    />
                  )}
                  {exercise.type === 'single_choice' && (
                    <SingleChoice
                      exerciseId={exercise.id}
                      options={config.options}
                      description={exercise.description}
                      initialCompleted={isCompleted}
                    />
                  )}
                  {exercise.type === 'multiple_choice' && (
                    <MultipleChoice
                      exerciseId={exercise.id}
                      options={config.options}
                      description={exercise.description}
                      initialCompleted={isCompleted}
                    />
                  )}
                  {exercise.type === 'fill_blank' && (
                    <FillBlank
                      exerciseId={exercise.id}
                      template={config.template}
                      hint={config.hint}
                      description={exercise.description}
                      initialCompleted={isCompleted}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
