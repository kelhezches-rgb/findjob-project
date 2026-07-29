'use client'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Star, FileText } from 'lucide-react'
import { useResumes } from '@/hooks'
import { Button, EmptyState, LoadingSpinner } from '@/components/ui'

export default function ResumesPage() {
  const { resumes, isLoading, deleteResume } = useResumes()

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`ลบ Resume "${title}" ใช่หรือไม่?`)) return
    deleteResume(id)
  }

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Resume ของฉัน</h1>
          <p className="text-sm text-gray-500">สร้างและจัดการ Resume สำหรับสมัครงาน</p>
        </div>
        <Link href="/seeker/resumes/create"><Button><Plus className="h-4 w-4" />สร้าง Resume</Button></Link>
      </div>

      {isLoading && <LoadingSpinner />}

      {!isLoading && resumes.length === 0 && (
        <EmptyState icon={<FileText className="h-12 w-12" />}
          title="ยังไม่มี Resume" description="สร้าง Resume เพื่อเริ่มสมัครงาน"
          action={<Link href="/seeker/resumes/create"><Button><Plus className="h-4 w-4" />สร้าง Resume</Button></Link>} />
      )}

      <div className="flex flex-col gap-3">
        {resumes.map(resume => (
          <div key={resume.id} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{resume.title}</h3>
                {resume.isPrimary && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />หลัก
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {resume.experiences.length} ประสบการณ์ · {resume.skills.length} ทักษะ ·
                แก้ไขล่าสุด {new Date(resume.updatedAt).toLocaleDateString('th-TH')}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Link href={`/resumes/${resume.id}`} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                <Pencil className="h-4 w-4" />
              </Link>
              <button onClick={() => handleDelete(resume.id, resume.title)}
                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
