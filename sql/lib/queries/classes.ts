import 'server-only'
import { pool } from '../db'
import { generateJoinCode } from '../utils'
import bcrypt from 'bcryptjs'
import { generatePassword } from '../utils'

export interface Class {
  id: number
  name: string
  teacher_id: number
  join_code: string
  created_at: string
}

export interface ClassWithCount extends Class {
  student_count: number
}

export interface StudentCredential {
  username: string
  password: string
}

export async function getClassesByTeacher(teacherId: number): Promise<ClassWithCount[]> {
  const [rows] = await pool.query(
    `SELECT c.*, COUNT(cm.user_id) as student_count
     FROM classes c
     LEFT JOIN class_members cm ON cm.class_id = c.id
     WHERE c.teacher_id = ?
     GROUP BY c.id
     ORDER BY c.created_at DESC`,
    [teacherId]
  )
  return rows as ClassWithCount[]
}

export async function getClassById(id: number): Promise<Class | undefined> {
  const [rows] = await pool.query('SELECT * FROM classes WHERE id = ?', [id])
  return (rows as Class[])[0]
}

export async function getClassByJoinCode(joinCode: string): Promise<Class | undefined> {
  const [rows] = await pool.query('SELECT * FROM classes WHERE join_code = ?', [joinCode])
  return (rows as Class[])[0]
}

export interface ClassMember {
  id: number
  username: string
  created_at: string
}

export async function getClassMembers(classId: number): Promise<ClassMember[]> {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.created_at
     FROM users u
     JOIN class_members cm ON cm.user_id = u.id
     WHERE cm.class_id = ?
     ORDER BY u.username ASC`,
    [classId]
  )
  return rows as ClassMember[]
}

export async function isClassMember(classId: number, userId: number): Promise<boolean> {
  const [rows] = await pool.query(
    'SELECT 1 FROM class_members WHERE class_id = ? AND user_id = ?',
    [classId, userId]
  )
  return (rows as unknown[]).length > 0
}

export async function createClassWithStudents(
  teacherId: number,
  className: string,
  studentCount: number
): Promise<{ classId: number; joinCode: string; credentials: StudentCredential[] }> {
  const joinCode = generateJoinCode()
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const [classResult] = await conn.query(
      'INSERT INTO classes (name, teacher_id, join_code) VALUES (?, ?, ?)',
      [className, teacherId, joinCode]
    )
    const classId = (classResult as { insertId: number }).insertId

    const credentials: StudentCredential[] = []
    for (let i = 1; i <= studentCount; i++) {
      const username = `student${i}_${joinCode.toLowerCase()}`
      const password = generatePassword()
      const hash = await bcrypt.hash(password, 10)
      const [userResult] = await conn.query(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
        [username, hash, 'student']
      )
      await conn.query(
        'INSERT INTO class_members (class_id, user_id) VALUES (?, ?)',
        [classId, (userResult as { insertId: number }).insertId]
      )
      credentials.push({ username, password })
    }

    await conn.commit()
    return { classId, joinCode, credentials }
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

export async function deleteClass(classId: number, teacherId: number): Promise<boolean> {
  const [result] = await pool.query(
    'DELETE FROM classes WHERE id = ? AND teacher_id = ?',
    [classId, teacherId]
  )
  return (result as { affectedRows: number }).affectedRows > 0
}

export async function addStudentToClass(classId: number, userId: number): Promise<void> {
  await pool.query(
    'INSERT IGNORE INTO class_members (class_id, user_id) VALUES (?, ?)',
    [classId, userId]
  )
}
