import 'server-only'
import { pool } from '../db'
import bcrypt from 'bcryptjs'
import { generatePassword } from '../utils'

export interface User {
  id: number
  username: string
  password_hash: string
  role: 'student' | 'teacher'
  created_at: string
}

export async function getUserById(id: number): Promise<User | undefined> {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
  return (rows as User[])[0]
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username])
  return (rows as User[])[0]
}

export async function createUser(username: string, password: string, role: 'student' | 'teacher'): Promise<User> {
  const hash = await bcrypt.hash(password, 10)
  const [result] = await pool.query(
    'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
    [username, hash, role]
  )
  return (await getUserById((result as { insertId: number }).insertId))!
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export interface StudentCredential {
  username: string
  password: string
}

export async function bulkCreateStudents(
  classId: number,
  count: number,
  classCode: string
): Promise<StudentCredential[]> {
  const credentials: StudentCredential[] = []
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    for (let i = 1; i <= count; i++) {
      const username = `student${i}_${classCode.toLowerCase()}`
      const password = generatePassword()
      const hash = await bcrypt.hash(password, 10)
      const [result] = await conn.query(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
        [username, hash, 'student']
      )
      await conn.query(
        'INSERT INTO class_members (class_id, user_id) VALUES (?, ?)',
        [classId, (result as { insertId: number }).insertId]
      )
      credentials.push({ username, password })
    }
    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
  return credentials
}
