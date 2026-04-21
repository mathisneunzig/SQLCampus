import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { getClassById, getClassMembers, deleteClass } from '@/lib/queries/classes'
import { getClassProgress } from '@/lib/queries/progress'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession()
    const { id } = await params
    const cls = await getClassById(parseInt(id, 10))

    if (!cls || cls.teacher_id !== session.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const [members, progress] = await Promise.all([
      getClassMembers(cls.id),
      getClassProgress(cls.id),
    ])

    return NextResponse.json({ class: cls, members, progress })
  } catch (err) {
    if (err instanceof Response || (err as { digest?: string }).digest === 'NEXT_REDIRECT') throw err
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession()
    if (session.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const { id } = await params
    const deleted = await deleteClass(parseInt(id, 10), session.userId)
    if (!deleted) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof Response || (err as { digest?: string }).digest === 'NEXT_REDIRECT') throw err
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
