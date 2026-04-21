import 'server-only'
import { pool } from '../db'

export interface Lesson {
  id: number
  slug: string
  title: string
  content_mdx: string
  order_index: number
  category: string
}

export interface Exercise {
  id: number
  lesson_id: number
  type: 'sql' | 'multiple_choice' | 'single_choice' | 'fill_blank'
  title: string
  description: string
  config_json: string
  order_index: number
}

export interface LessonWithExercises extends Lesson {
  exercises: Exercise[]
}

export async function getAllLessons(): Promise<Lesson[]> {
  const [rows] = await pool.query('SELECT * FROM lessons ORDER BY order_index ASC')
  return rows as Lesson[]
}

export async function getLessonsByCategory(): Promise<Record<string, Lesson[]>> {
  const lessons = await getAllLessons()
  const grouped: Record<string, Lesson[]> = {}
  for (const lesson of lessons) {
    if (!grouped[lesson.category]) grouped[lesson.category] = []
    grouped[lesson.category].push(lesson)
  }
  return grouped
}

export async function getLessonBySlug(slug: string): Promise<Lesson | undefined> {
  const [rows] = await pool.query('SELECT * FROM lessons WHERE slug = ?', [slug])
  return (rows as Lesson[])[0]
}

export async function getLessonWithExercises(slug: string): Promise<LessonWithExercises | undefined> {
  const lesson = await getLessonBySlug(slug)
  if (!lesson) return undefined
  const [rows] = await pool.query(
    'SELECT * FROM exercises WHERE lesson_id = ? ORDER BY order_index ASC',
    [lesson.id]
  )
  return { ...lesson, exercises: rows as Exercise[] }
}

export async function getTotalExerciseCount(): Promise<number> {
  const [rows] = await pool.query('SELECT COUNT(*) as c FROM exercises')
  return ((rows as { c: number }[])[0]).c
}

export async function getExerciseCountsByLesson(): Promise<Record<number, number>> {
  const [rows] = await pool.query('SELECT lesson_id, COUNT(*) as total FROM exercises GROUP BY lesson_id')
  return Object.fromEntries((rows as { lesson_id: number; total: number }[]).map(r => [r.lesson_id, r.total]))
}
