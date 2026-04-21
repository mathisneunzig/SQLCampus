import 'server-only'
import { pool } from '../db'

export interface ProgressRecord {
  user_id: number
  exercise_id: number
  completed_at: string | null
  attempts: number
  last_answer: string
}

export interface ProgressWithExercise extends ProgressRecord {
  exercise_title: string
  exercise_type: string
  lesson_title: string
  lesson_slug: string
}

export async function recordProgress(
  userId: number,
  exerciseId: number,
  answer: string,
  correct: boolean
): Promise<void> {
  const [existing] = await pool.query(
    'SELECT * FROM user_progress WHERE user_id = ? AND exercise_id = ?',
    [userId, exerciseId]
  )
  const row = (existing as ProgressRecord[])[0]

  if (row) {
    await pool.query(
      `UPDATE user_progress
       SET attempts = attempts + 1,
           last_answer = ?,
           completed_at = IF(? AND completed_at IS NULL, NOW(), completed_at)
       WHERE user_id = ? AND exercise_id = ?`,
      [answer, correct ? 1 : 0, userId, exerciseId]
    )
  } else if (correct) {
    await pool.query(
      'INSERT INTO user_progress (user_id, exercise_id, last_answer, completed_at) VALUES (?, ?, ?, NOW())',
      [userId, exerciseId, answer]
    )
  } else {
    await pool.query(
      `INSERT INTO user_progress (user_id, exercise_id, attempts, last_answer, completed_at)
       VALUES (?, ?, 1, ?, NULL)
       ON DUPLICATE KEY UPDATE attempts = attempts + 1, last_answer = VALUES(last_answer)`,
      [userId, exerciseId, answer]
    )
  }
}

export async function getUserProgress(userId: number): Promise<ProgressWithExercise[]> {
  const [rows] = await pool.query(
    `SELECT
       up.*,
       e.title as exercise_title,
       e.type as exercise_type,
       l.title as lesson_title,
       l.slug as lesson_slug
     FROM user_progress up
     JOIN exercises e ON e.id = up.exercise_id
     JOIN lessons l ON l.id = e.lesson_id
     WHERE up.user_id = ? AND up.completed_at IS NOT NULL
     ORDER BY up.completed_at DESC`,
    [userId]
  )
  return rows as ProgressWithExercise[]
}

export async function getCompletedExerciseIds(userId: number): Promise<Set<number>> {
  const [rows] = await pool.query(
    'SELECT exercise_id FROM user_progress WHERE user_id = ? AND completed_at IS NOT NULL',
    [userId]
  )
  return new Set((rows as { exercise_id: number }[]).map(r => r.exercise_id))
}

export interface StudentProgress {
  user_id: number
  username: string
  exercise_id: number | null
  completed_at: string | null
}

export async function getClassProgress(classId: number): Promise<StudentProgress[]> {
  const [rows] = await pool.query(
    `SELECT
       u.id as user_id,
       u.username,
       up.exercise_id,
       up.completed_at
     FROM users u
     JOIN class_members cm ON cm.user_id = u.id AND cm.class_id = ?
     LEFT JOIN user_progress up ON up.user_id = u.id AND up.completed_at IS NOT NULL
     ORDER BY u.username ASC, up.exercise_id ASC`,
    [classId]
  )
  return rows as StudentProgress[]
}

export interface ClassProgressSummary {
  student_id: number
  username: string
  completed_count: number
}

export async function getClassProgressSummary(classId: number): Promise<ClassProgressSummary[]> {
  const [rows] = await pool.query(
    `SELECT
       u.id as student_id,
       u.username,
       COUNT(up.exercise_id) as completed_count
     FROM users u
     JOIN class_members cm ON cm.user_id = u.id AND cm.class_id = ?
     LEFT JOIN user_progress up ON up.user_id = u.id AND up.completed_at IS NOT NULL
     GROUP BY u.id, u.username
     ORDER BY u.username ASC`,
    [classId]
  )
  return rows as ClassProgressSummary[]
}

export async function getCompletedCountsByLesson(userId: number): Promise<Record<number, number>> {
  const [rows] = await pool.query(
    `SELECT e.lesson_id, COUNT(*) as cnt
     FROM user_progress up
     JOIN exercises e ON e.id = up.exercise_id
     WHERE up.user_id = ? AND up.completed_at IS NOT NULL
     GROUP BY e.lesson_id`,
    [userId]
  )
  return Object.fromEntries((rows as { lesson_id: number; cnt: number }[]).map(r => [r.lesson_id, r.cnt]))
}
