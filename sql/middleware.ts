import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/auth'

const PUBLIC_PATHS = ['/login', '/register']
const TEACHER_PATHS = ['/teacher']

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  const token = req.cookies.get('session')?.value
  const session = token ? await decrypt(token) : null

  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p))
  const isTeacher = TEACHER_PATHS.some(p => pathname.startsWith(p))

  if (!session?.userId && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isTeacher && session?.role !== 'teacher') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (session?.userId && isPublic) {
    const role = session.role
    return NextResponse.redirect(new URL(role === 'teacher' ? '/teacher/dashboard' : '/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sql-wasm.wasm).*)'],
}
