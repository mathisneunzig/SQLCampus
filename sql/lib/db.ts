import 'server-only'
import mysql from 'mysql2/promise'

declare global {
  var __pool: mysql.Pool | undefined
}

function createPool(): mysql.Pool {
  const host = process.env.MYSQL_HOST ?? 'localhost'
  const port = parseInt(process.env.MYSQL_PORT ?? '3306', 10)
  const user = process.env.MYSQL_USER
  const password = process.env.MYSQL_PASSWORD
  const database = process.env.MYSQL_DATABASE

  if (!user || !password || !database) {
    throw new Error('Missing required MySQL env vars: MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE')
  }

  return mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    timezone: '+00:00',
  })
}

export const pool: mysql.Pool =
  globalThis.__pool ?? (globalThis.__pool = createPool())

export async function initSchema(): Promise<void> {
  const conn = await pool.getConnection()
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('student','teacher') NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        teacher_id INT NOT NULL,
        join_code VARCHAR(10) NOT NULL UNIQUE,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users(id)
      )
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS class_members (
        class_id INT NOT NULL,
        user_id INT NOT NULL,
        PRIMARY KEY (class_id, user_id),
        INDEX idx_members_class (class_id),
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(120) NOT NULL UNIQUE,
        title VARCHAR(200) NOT NULL,
        content_mdx MEDIUMTEXT NOT NULL,
        order_index INT NOT NULL DEFAULT 0,
        category VARCHAR(80) NOT NULL,
        INDEX idx_lessons_slug (slug),
        INDEX idx_lessons_order (order_index)
      )
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lesson_id INT NOT NULL,
        type ENUM('sql','multiple_choice','single_choice','fill_blank') NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        config_json MEDIUMTEXT NOT NULL DEFAULT '{}',
        order_index INT NOT NULL DEFAULT 0,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id),
        INDEX idx_exercises_lesson (lesson_id, order_index)
      )
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        user_id INT NOT NULL,
        exercise_id INT NOT NULL,
        completed_at DATETIME NULL DEFAULT NULL,
        attempts INT NOT NULL DEFAULT 1,
        last_answer TEXT NOT NULL DEFAULT '',
        PRIMARY KEY (user_id, exercise_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
        INDEX idx_progress_user (user_id)
      )
    `)

    // Index on class_members is part of the table DDL above
  } finally {
    conn.release()
  }
}
