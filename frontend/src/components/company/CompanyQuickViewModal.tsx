'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X, Users, MapPin, BadgeCheck } from 'lucide-react'
import { api } from '@/lib/api'
import { CompanyLogo } from './CompanyLogo'
import { LoadingSpinner } from '@/components/ui'
import { Company } from '@/types'

interface CompanyQuickViewModalProps {
  companyId: string
  onClose: () => void
}

export function CompanyQuickViewModal({ companyId, onClose }: CompanyQuickViewModalProps) {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api.get<{ company: Company }>(`/companies/${companyId}`)
      .then(r => { if (active) setCompany(r.data.company) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [companyId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิด"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>

        {loading ? (
          <div className="py-8"><LoadingSpinner /></div>
        ) : company ? (
          <>
            <div className="flex flex-col items-center gap-3 text-center">
              <CompanyLogo
                name={company.name}
                logoUrl={company.logoUrl}
                size="lg"
                className="h-20 w-20 rounded-2xl text-3xl"
              />
              <div>
                <div className="flex items-center justify-center gap-1.5">
                  <h3 className="font-bold text-gray-900">{company.name}</h3>
                  {company.isVerified && <BadgeCheck className="h-4 w-4 shrink-0 text-indigo-500" />}
                </div>
                {company.createdAt && (
                  <p className="mt-0.5 text-xs text-gray-400">
                    เข้าร่วม JobBoard ในปี {new Date(company.createdAt).getFullYear() + 543}
                  </p>
                )}
              </div>
            </div>

            {(company.industry || company.size || company.province) && (
              <div className="mt-5 flex flex-col gap-2 text-sm">
                {company.industry && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-400">อุตสาหกรรม</span>
                    <span className="text-right text-gray-700">{company.industry}</span>
                  </div>
                )}
                {company.size && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1 text-gray-400"><Users className="h-3.5 w-3.5" />ขนาดบริษัท</span>
                    <span className="text-gray-700">{company.size} คน</span>
                  </div>
                )}
                {company.province && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1 text-gray-400"><MapPin className="h-3.5 w-3.5" />ที่ตั้ง</span>
                    <span className="text-gray-700">{company.province}</span>
                  </div>
                )}
              </div>
            )}

            {company.description && (
              <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-gray-600">{company.description}</p>
            )}

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                ปิด
              </button>
              <Link
                href={`/companies/${company.id}`}
                className="flex-1 rounded-lg bg-indigo-600 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                ดูโปรไฟล์บริษัท
              </Link>
            </div>
          </>
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">ไม่พบข้อมูลบริษัท</p>
        )}
      </div>
    </div>
  )
}
