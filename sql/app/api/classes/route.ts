import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { getClassesByTeacher, createClassWithStudents } from '@/lib/queries/classes'

export async function GET() {
  try {
    const session = await verifySession()
    if (session.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const classes = await getClassesByTeacher(session.userId)
    return NextResponse.json({ classes })
  } catch (err) {
    if (err instanceof Response || (err as { digest?: string }).digest === 'NEXT_REDIRECT') throw err
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession()
    if (session.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { name, studentCount } = await req.json()

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Class name is required' }, { status: 400 })
    }
    if (!studentCount || typeof studentCount !== 'number' || studentCount < 1 || studentCount > 500) {
      return NextResponse.json({ error: 'Student count must be 1-500' }, { status: 400 })
    }

    const result = await createClassWithStudents(session.userId, name.trim(), studentCount)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof Response || (err as { digest?: string }).digest === 'NEXT_REDIRECT') throw err
    console.error('Create class error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
