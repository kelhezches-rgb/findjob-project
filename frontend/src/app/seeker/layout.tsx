'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { SeekerNavbar } from '@/components/layout'
import { LoadingSpinner } from '@/components/ui'
import { VerificationBanner } from '@/components/ui/VerificationBanner'

export default function SeekerLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'seeker')) router.replace('/auth/login')
  }, [user, isLoading, router])

  if (isLoading) return <LoadingSpinner />
  if (!user || user.role !== 'seeker') return null

  return (
    <div className="min-h-screen bg-gray-50">
      <SeekerNavbar />
      <VerificationBanner />
      {children}
    </div>
  )
}
