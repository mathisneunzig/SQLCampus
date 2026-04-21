import { NextRequest, NextResponse } from 'next/server'
import { getUserByUsername, verifyPassword } from '@/lib/queries/users'
import { createSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    const user = await getUserByUsername(String(username).trim().toLowerCase())
    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    const valid = await verifyPassword(String(password), user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    await createSession(user.id, user.role)
    return NextResponse.json({ ok: true, role: user.role })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
