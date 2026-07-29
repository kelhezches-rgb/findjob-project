'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { EmployerNavbar } from '@/components/layout'
import { LoadingSpinner } from '@/components/ui'

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'employer')) router.replace('/auth/login')
  }, [user, isLoading, router])

  if (isLoading) return <LoadingSpinner />
  if (!user || user.role !== 'employer') return null

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployerNavbar />
      {children}
    </div>
  )
}
