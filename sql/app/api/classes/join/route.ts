import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { getClassByJoinCode, addStudentToClass, isClassMember } from '@/lib/queries/classes'

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession()

    if (session.role !== 'student') {
      return NextResponse.json({ error: 'Only students can join classes' }, { status: 403 })
    }

    const { joinCode } = await req.json()
    if (!joinCode || typeof joinCode !== 'string') {
      return NextResponse.json({ error: 'Join code is required' }, { status: 400 })
    }

    const cls = await getClassByJoinCode(joinCode.trim().toUpperCase())
    if (!cls) {
      return NextResponse.json({ error: 'Invalid join code' }, { status: 404 })
    }

    const alreadyMember = await isClassMember(cls.id, session.userId)
    if (alreadyMember) {
      return NextResponse.json({ error: 'You are already in this class' }, { status: 409 })
    }

    await addStudentToClass(cls.id, session.userId)
    return NextResponse.json({ ok: true, className: cls.name })
  } catch (err) {
    if (err instanceof Response || (err as { digest?: string }).digest === 'NEXT_REDIRECT') throw err
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
