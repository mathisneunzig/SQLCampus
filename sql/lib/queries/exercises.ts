import 'server-only'
import Database from 'better-sqlite3'
import { pool } from '../db'

export interface Exercise {
  id: number
  lesson_id: number
  type: 'sql' | 'multiple_choice' | 'single_choice' | 'fill_blank'
  title: string
  description: string
  config_json: string
  order_index: number
}

export interface SqlExerciseConfig {
  setup_sql: string
  expected_rows: unknown[][]
  check_mode: 'rows_match' | 'row_count'
}

export async function getExerciseById(id: number): Promise<Exercise | undefined> {
  const [rows] = await pool.query('SELECT * FROM exercises WHERE id = ?', [id])
  return (rows as Exercise[])[0]
}

export function checkSqlAnswer(
  config: SqlExerciseConfig,
  studentSql: string
): { correct: boolean; error?: string; result?: unknown[][] } {
  // Run in an in-memory SQLite sandbox (not the production MySQL DB)
  const sandboxDb = new Database(':memory:')
  try {
    sandboxDb.exec(config.setup_sql)
    const stmt = sandboxDb.prepare(studentSql)
    const rows = stmt.all() as Record<string, unknown>[]
    const resultRows = rows.map(row => Object.values(row))

    if (config.check_mode === 'row_count') {
      const correct = resultRows.length === config.expected_rows.length
      return { correct, result: resultRows }
    }

    if (resultRows.length !== config.expected_rows.length) {
      return { correct: false, result: resultRows }
    }

    const normalize = (v: unknown) => String(v ?? '').trim().toLowerCase()
    const correct = config.expected_rows.every((expectedRow, i) => {
      const actualRow = resultRows[i]
      return Array.isArray(expectedRow) &&
        expectedRow.length === actualRow.length &&
        expectedRow.every((cell, j) => normalize(cell) === normalize(actualRow[j]))
    })

    return { correct, result: resultRows }
  } catch (err) {
    return { correct: false, error: err instanceof Error ? err.message : 'Query error' }
  } finally {
    sandboxDb.close()
  }
}
