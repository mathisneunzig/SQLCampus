import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { getExerciseById, checkSqlAnswer, type SqlExerciseConfig } from '@/lib/queries/exercises'
import { recordProgress } from '@/lib/queries/progress'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession()
    const { id } = await params
    const exerciseId = parseInt(id, 10)

    if (isNaN(exerciseId)) {
      return NextResponse.json({ error: 'Invalid exercise ID' }, { status: 400 })
    }

    const exercise = await getExerciseById(exerciseId)
    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    }

    const body = await request.json()
    const answer = body.answer
    const config = JSON.parse(exercise.config_json)
    let correct = false
    let error: string | undefined

    switch (exercise.type) {
      case 'sql': {
        const result = checkSqlAnswer(config as SqlExerciseConfig, String(answer))
        correct = result.correct
        error = result.error
        break
      }

      case 'single_choice': {
        correct = Number(answer) === Number(config.correct)
        break
      }

      case 'multiple_choice': {
        const userAnswers = Array.isArray(answer) ? [...answer].map(Number).sort() : []
        const expected = [...config.correct].map(Number).sort()
        correct = JSON.stringify(userAnswers) === JSON.stringify(expected)
        break
      }

      case 'fill_blank': {
        const blanks: string[] = Array.isArray(answer) ? answer : [answer]
        correct = blanks.length === config.blanks.length &&
          blanks.every((v: string, i: number) =>
            v.trim().toLowerCase() === config.blanks[i].toLowerCase()
          )
        break
      }
    }

    await recordProgress(session.userId, exerciseId, JSON.stringify(answer), correct)

    return NextResponse.json({ correct, error })
  } catch (err) {
    if (err instanceof Response || (err as { digest?: string }).digest === 'NEXT_REDIRECT') {
      throw err
    }
    console.error('Submit error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
