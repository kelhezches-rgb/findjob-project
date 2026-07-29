'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AdminNavbar } from '@/components/layout'
import { LoadingSpinner } from '@/components/ui'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) router.replace('/auth/login')
  }, [user, isLoading, router])

  if (isLoading) return <LoadingSpinner />
  if (!user || user.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  )
}
