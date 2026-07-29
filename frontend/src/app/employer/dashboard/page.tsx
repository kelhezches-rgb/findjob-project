'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Briefcase, Users, Eye, Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { Button, LoadingSpinner } from '@/components/ui'
import { CompanyLogo } from '@/components/company/CompanyLogo'

interface EmployerOverview {
  totalJobs: number
  activeJobs: number
  totalApplicants: number
  totalViews: number
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

export default function EmployerDashboardPage() {
  const { user } = useAuth()
  const [overview, setOverview] = useState<EmployerOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Derive overview stats from the employer's own job list —
    // there's no dedicated /employer/stats endpoint yet, so we
    // aggregate client-side from /employer/jobs (kept intentionally
    // simple; move to a real backend aggregate if this list grows large).
    api.get('/employer/jobs', { params: { page: 1, limit: 100 } })
      .then(r => {
        const jobs = r.data.jobs as Array<{ status: string; viewsCount: number; _count?: { applications: number } }>
        setOverview({
          totalJobs:       jobs.length,
          activeJobs:      jobs.filter(j => j.status === 'active').length,
          totalApplicants: jobs.reduce((sum, j) => sum + (j._count?.applications ?? 0), 0),
          totalViews:      jobs.reduce((sum, j) => sum + (j.viewsCount ?? 0), 0),
        })
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {user?.employer?.company && (
            <CompanyLogo name={user.employer.company.name} logoUrl={user.employer.company.logoUrl} size="md" />
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              สวัสดี{user?.employer?.company?.name ? `, ${user.employer.company.name}` : ''} 👋
            </h1>
            <p className="text-sm text-gray-500">ภาพรวมการรับสมัครงานของคุณ</p>
          </div>
        </div>
        <Link href="/employer/jobs/create"><Button><Plus className="h-4 w-4" />ลงประกาศใหม่</Button></Link>
      </div>

      {isLoading && <LoadingSpinner />}

      {!isLoading && overview && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Briefcase className="h-4 w-4" />} label="ประกาศงานทั้งหมด" value={overview.totalJobs} />
            <StatCard icon={<Eye className="h-4 w-4" />}       label="เปิดรับสมัครอยู่"   value={overview.activeJobs} />
            <StatCard icon={<Users className="h-4 w-4" />}     label="ผู้สมัครทั้งหมด"    value={overview.totalApplicants} />
            <StatCard icon={<Eye className="h-4 w-4" />}       label="ยอดเข้าชมทั้งหมด"   value={overview.totalViews} />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
            <p className="text-sm text-gray-500 mb-4">ดูรายละเอียดประกาศงานและจัดการผู้สมัครทั้งหมด</p>
            <Link href="/employer/jobs">
              <Button variant="secondary">ไปที่ประกาศงานของฉัน</Button>
            </Link>
          </div>
        </>
      )}
    </main>
  )
}
