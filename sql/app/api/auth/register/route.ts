import { NextRequest, NextResponse } from 'next/server'
import { getUserByUsername, createUser } from '@/lib/queries/users'
import { createSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password, role } = await req.json()

    if (!username || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const normalizedUsername = String(username).trim().toLowerCase()

    if (!/^[a-zA-Z0-9_\-]{3,32}$/.test(normalizedUsername)) {
      return NextResponse.json({ error: 'Username must be 3-32 characters (letters, numbers, _ -)' }, { status: 400 })
    }

    if (String(password).length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    if (!['student', 'teacher'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const existing = await getUserByUsername(normalizedUsername)
    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    const user = await createUser(normalizedUsername, String(password), role as 'student' | 'teacher')
    await createSession(user.id, user.role)

    return NextResponse.json({ ok: true, role: user.role })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
