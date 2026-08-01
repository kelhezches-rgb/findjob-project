'use client'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Users, Eye, EyeOff } from 'lucide-react'
import { useEmployerJobs } from '@/hooks'
import { Button, Badge, EmptyState, LoadingSpinner, PaginationBar } from '@/components/ui'
import { formatSalary } from '@/lib/salary'
import { Job } from '@/types'

export default function EmployerJobsPage() {
  const { jobs, pagination, isLoading, deleteJob, setStatus, refetch } = useEmployerJobs()

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`ลบประกาศ "${title}" ใช่หรือไม่?`)) return
    deleteJob(id)
  }

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">ประกาศงานของฉัน</h1>
          <p className="text-sm text-gray-500">จัดการตำแหน่งงานและดูผู้สมัคร</p>
        </div>
        <Link href="/employer/jobs/create"><Button><Plus className="h-4 w-4" />ลงประกาศใหม่</Button></Link>
      </div>

      {isLoading && <LoadingSpinner />}

      {!isLoading && jobs.length === 0 && (
        <EmptyState icon={<div className="text-5xl">📋</div>} title="ยังไม่มีประกาศงาน" description="เริ่มลงประกาศงานแรกของคุณ"
          action={<Link href="/employer/jobs/create"><Button><Plus className="h-4 w-4" />ลงประกาศงาน</Button></Link>} />
      )}

      <div className="flex flex-col gap-3">
        {jobs.map(job => (
          <div key={job.id} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  <Badge label={job.status} variant={job.status} />
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{job.location || 'ไม่ระบุสถานที่'} · {formatSalary(job)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Link href={`/employer/jobs/${job.id}/applicants`} className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-50">
                  <Users className="h-4 w-4" />{job._count?.applications ?? 0} ผู้สมัคร
                </Link>
                <Link href={`/employer/jobs/${job.id}/edit`} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                  <Pencil className="h-4 w-4" />
                </Link>
                <button onClick={() => handleDelete(job.id, job.title)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-400">แก้ไขล่าสุด {new Date(job.updatedAt).toLocaleDateString('th-TH')}</p>
              {job.status === 'active'
                ? <button onClick={() => setStatus(job.id, 'closed')} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                    <EyeOff className="h-3.5 w-3.5" />ปิดรับสมัคร
                  </button>
                : (job.status === 'draft' || job.status === 'closed')
                  ? <button onClick={() => setStatus(job.id, 'active')} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700">
                      <Eye className="h-3.5 w-3.5" />เผยแพร่
                    </button>
                  : null
              }
            </div>
          </div>
        ))}
      </div>

      {pagination && <PaginationBar pagination={pagination} onPageChange={p => refetch({ page: p })} />}
    </main>
  )
}
