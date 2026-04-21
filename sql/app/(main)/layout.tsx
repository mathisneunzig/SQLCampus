import { verifySession } from '@/lib/auth'
import { getUserById } from '@/lib/queries/users'
import Navbar from '@/components/layout/Navbar'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession()
  const user = await getUserById(session.userId)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar username={user?.username ?? 'User'} role={session.role} />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-blue-800 text-blue-200 text-center py-4 text-sm">
        © {new Date().getFullYear()} SQL Campus · Learn SQL step by step
      </footer>
    </div>
  )
}
