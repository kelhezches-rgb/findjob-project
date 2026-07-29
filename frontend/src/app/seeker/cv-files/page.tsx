'use client'
import { useEffect, useRef, useState } from 'react'
import { FileText, Upload, Trash2, Download } from 'lucide-react'
import { api, API_ORIGIN } from '@/lib/api'
import { useResumes } from '@/hooks'
import { Select, EmptyState, LoadingSpinner } from '@/components/ui'

interface CvFile {
  id: string; title: string
  cvFileUrl: string | null; cvFileName: string | null; cvFileSize: number | null
  updatedAt: string
}

const formatSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function CvFilesPage() {
  const { resumes } = useResumes()
  const [cvFiles, setCvFiles] = useState<CvFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchCvFiles = async () => {
    setIsLoading(true)
    try {
      const { data } = await api.get<{ cvFiles: CvFile[] }>('/seeker/cv-files')
      setCvFiles(data.cvFiles)
    } finally { setIsLoading(false) }
  }

  useEffect(() => { fetchCvFiles() }, [])

  useEffect(() => {
    if (!selectedResumeId && resumes.length > 0) {
      const primary = resumes.find(r => r.isPrimary) || resumes[0]
      setSelectedResumeId(primary.id)
    }
  }, [resumes, selectedResumeId])

  const handleUpload = async (file: File) => {
    setError(null); setSuccess(null)
    if (file.type !== 'application/pdf') { setError('รองรับเฉพาะไฟล์ PDF เท่านั้น'); return }
    if (file.size > 5 * 1024 * 1024) { setError('ขนาดไฟล์ต้องไม่เกิน 5MB'); return }
    if (!selectedResumeId) { setError('กรุณาเลือก Resume ก่อนอัปโหลด'); return }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await api.post(`/seeker/cv-files/${selectedResumeId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSuccess(`อัปโหลด "${file.name}" สำเร็จ`)
      await fetchCvFiles()
    } catch (e: any) { setError(e?.response?.data?.message || 'อัปโหลดไม่สำเร็จ') }
    finally { setUploading(false) }
  }

  const handleDelete = async (resumeId: string, fileName: string) => {
    if (!confirm(`ลบไฟล์ "${fileName}" ออกจาก Resume ใช่หรือไม่?`)) return
    try { await api.delete(`/seeker/cv-files/${resumeId}`); setSuccess('ลบไฟล์สำเร็จ'); await fetchCvFiles() }
    catch (e: any) { setError(e?.response?.data?.message || 'ลบไม่สำเร็จ') }
  }

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">ไฟล์ CV ของฉัน</h1>
        <p className="text-sm text-gray-500">อัปโหลด CV เป็นไฟล์ PDF แนบกับ Resume</p>
      </div>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">อัปโหลด CV ใหม่</h2>

        {error   && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

        {resumes.length === 0 ? (
          <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-4 py-3">
            คุณยังไม่มี Resume — <a href="/seeker/resumes/create" className="underline">สร้าง Resume</a> ก่อนอัปโหลด CV
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <Select label="แนบ CV กับ Resume" value={selectedResumeId} onChange={e => setSelectedResumeId(e.target.value)}>
              {resumes.map(r => <option key={r.id} value={r.id}>{r.title}{r.isPrimary ? ' (Resume หลัก)' : ''}</option>)}
            </Select>

            <div
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const file = e.dataTransfer.files?.[0]; if (file) handleUpload(file) }}
            >
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">{uploading ? 'กำลังอัปโหลด...' : 'ลากไฟล์ PDF มาวาง หรือคลิกเพื่อเลือก'}</p>
              <p className="text-xs text-gray-400">รองรับเฉพาะ PDF ขนาดไม่เกิน 5MB</p>
              <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden"
                onChange={e => { const file = e.target.files?.[0]; if (file) handleUpload(file); e.target.value = '' }} />
            </div>
          </div>
        )}
      </div>

      <h2 className="text-base font-semibold text-gray-900 mb-3">ไฟล์ CV ที่อัปโหลดแล้ว</h2>

      {isLoading && <LoadingSpinner />}
      {!isLoading && cvFiles.length === 0 && (
        <EmptyState icon={<FileText className="h-12 w-12" />} title="ยังไม่มีไฟล์ CV" description="อัปโหลดไฟล์ PDF ด้านบนเพื่อแนบกับ Resume" />
      )}

      <div className="flex flex-col gap-3">
        {cvFiles.map(file => (
          <div key={file.id} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
              <FileText className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{file.cvFileName}</p>
              <p className="text-xs text-gray-400">
                แนบกับ: <span className="text-gray-600">{file.title}</span>
                {file.cvFileSize && ` · ${formatSize(file.cvFileSize)}`}
                {` · ${new Date(file.updatedAt).toLocaleDateString('th-TH')}`}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {file.cvFileUrl && (
                <a href={`${API_ORIGIN}${file.cvFileUrl}`} target="_blank" rel="noopener noreferrer"
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100" aria-label="ดาวน์โหลด">
                  <Download className="h-4 w-4" />
                </a>
              )}
              <button onClick={() => handleDelete(file.id, file.cvFileName || 'ไฟล์นี้')}
                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label="ลบไฟล์">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
