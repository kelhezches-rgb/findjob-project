'use client'
import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import { Button, LoadingSpinner } from '@/components/ui'

interface DeletionImpact {
  id: string; name: string; isActive: boolean
  employersCount: number; jobsCount: number; applicationsCount: number
}

interface DeleteCompanyModalProps {
  companyId: string
  onClose: () => void
  onDeleted: () => void
}

export function DeleteCompanyModal({ companyId, onClose, onDeleted }: DeleteCompanyModalProps) {
  const { showToast } = useToast()
  const [impact, setImpact] = useState<DeletionImpact | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [confirmInput, setConfirmInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    api.get<DeletionImpact>(`/admin/companies/${companyId}/deletion-impact`)
      .then(r => { if (active) setImpact(r.data) })
      .catch(e => { if (active) setLoadError(e?.response?.data?.message || 'ไม่สามารถโหลดข้อมูลบริษัทได้') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [companyId])

  const isMatch = impact && (confirmInput === impact.name || confirmInput === 'DELETE')

  const handleDelete = async () => {
    if (!isMatch || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await api.delete(`/admin/companies/${companyId}`, { data: { confirmation: confirmInput } })
      showToast(`ลบบริษัท "${impact!.name}" เรียบร้อยแล้ว`, 'success')
      onDeleted()
    } catch (e: any) {
      setSubmitError(e?.response?.data?.message || 'ไม่สามารถลบบริษัทได้')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="ปิด"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>

        <h2 className="flex items-center gap-2 text-base font-semibold text-red-700">
          <AlertTriangle className="h-5 w-5" /> ลบบริษัท
        </h2>

        {loading && <div className="py-8"><LoadingSpinner /></div>}
        {loadError && <p className="mt-4 text-sm text-red-600">{loadError}</p>}

        {impact && (
          <>
            <p className="mt-3 text-sm text-gray-600">
              คุณกำลังจะลบบริษัท <span className="font-semibold text-gray-900">{impact.name}</span>
              {' '}การกระทำนี้จะส่งผลกระทบต่อ:
            </p>
            <ul className="mt-2 space-y-1 rounded-lg bg-gray-50 px-3.5 py-2.5 text-sm text-gray-700">
              <li>ผู้ใช้ระดับ HR: <span className="font-medium">{impact.employersCount}</span> คน</li>
              <li>ตำแหน่งงาน: <span className="font-medium">{impact.jobsCount}</span> ตำแหน่ง</li>
              <li>ใบสมัครที่เกี่ยวข้อง: <span className="font-medium">{impact.applicationsCount}</span> ใบ (จะไม่ถูกลบ)</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              บริษัทจะถูกปิดการใช้งานและซ่อนจากการค้นหาสาธารณะ ตำแหน่งงานที่เปิดอยู่จะถูกปิดรับสมัคร
              ใบสมัคร ประวัติ และข้อมูลผู้ใช้ HR จะยังคงถูกเก็บรักษาไว้ (ไม่ใช่การลบถาวร)
            </p>

            <p className="mt-4 text-sm text-gray-600">
              พิมพ์ชื่อบริษัท (<span className="font-mono font-semibold">{impact.name}</span>) หรือ{' '}
              <span className="font-mono font-semibold">DELETE</span> เพื่อยืนยัน
            </p>
            <input
              type="text"
              value={confirmInput}
              onChange={e => setConfirmInput(e.target.value)}
              placeholder={impact.name}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
            {submitError && <p className="mt-2 text-xs text-red-600">{submitError}</p>}

            <div className="mt-5 flex gap-2">
              <button type="button" onClick={onClose} disabled={submitting}
                className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                ยกเลิก
              </button>
              <Button type="button" variant="danger" disabled={!isMatch} isLoading={submitting}
                onClick={handleDelete} className="flex-1 disabled:opacity-40">
                ลบบริษัท
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
