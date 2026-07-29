'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

export function VerificationBanner() {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [sending,   setSending]   = useState(false)
  const [sent,      setSent]      = useState(false)

  if (!user || user.isVerified || dismissed) return null

  const resend = async () => {
    setSending(true)
    try { await api.post('/auth/resend-verification', { email: user.email }); setSent(true) }
    finally { setSending(false) }
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-amber-800">
          <svg className="h-4 w-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
          </svg>
          <span>{sent ? 'ส่งอีเมลยืนยันแล้ว — กรุณาตรวจกล่องข้อความ' : 'อีเมลของคุณยังไม่ได้รับการยืนยัน'}</span>
          {!sent && (
            <button onClick={resend} disabled={sending} className="font-medium underline hover:no-underline disabled:opacity-60">
              ส่งอีเมลยืนยันอีกครั้ง
            </button>
          )}
        </div>
        <button onClick={() => setDismissed(true)} className="shrink-0 rounded p-1 text-amber-600 hover:bg-amber-100" aria-label="ปิด">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
