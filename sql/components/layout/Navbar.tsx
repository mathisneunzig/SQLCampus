'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface NavbarProps {
  username: string
  role: string
}

export default function Navbar({ username, role }: NavbarProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <header className="bg-blue-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="text-xl font-bold tracking-tight hover:text-blue-200 transition">
          SQL Campus
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/learn" className="hover:text-blue-200 transition">
            Tutorials
          </Link>
          {role === 'teacher' && (
            <Link href="/teacher/classes" className="hover:text-blue-200 transition">
              My Classes
            </Link>
          )}
          <Link href="/profile" className="hover:text-blue-200 transition">
            My Progress
          </Link>
        </nav>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg text-sm transition"
          >
            <span className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center text-xs font-bold">
              {username[0]?.toUpperCase()}
            </span>
            <span className="hidden sm:block">{username}</span>
            <span className="text-blue-300">▾</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white text-gray-800 rounded-xl shadow-lg border border-blue-100 py-1 text-sm z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="font-medium">{username}</p>
                <p className="text-xs text-blue-600 capitalize">{role}</p>
              </div>
              <Link
                href="/profile"
                className="block px-4 py-2 hover:bg-blue-50 transition"
                onClick={() => setMenuOpen(false)}
              >
                My Progress
              </Link>
              {role === 'teacher' && (
                <Link
                  href="/teacher/dashboard"
                  className="block px-4 py-2 hover:bg-blue-50 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Teacher Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 transition"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
