import { verifySession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { getUserById } from '@/lib/queries/users'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession()
  if (session.role !== 'teacher') {
    redirect('/')
  }
  const user = await getUserById(session.userId)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar username={user?.username ?? 'Teacher'} role="teacher" />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-blue-800 text-blue-200 text-center py-4 text-sm">
        © {new Date().getFullYear()} SQL Campus · Teacher Portal
      </footer>
    </div>
  )
}
