'use client'
import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui'

type Step = 'closed' | 'type-delete' | 'type-confirm'

export function DeleteAccountSection() {
  const { logout } = useAuth()
  const { showToast } = useToast()
  const [step, setStep] = useState<Step>('closed')
  const [deleteInput, setDeleteInput] = useState('')
  const [confirmInput, setConfirmInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const close = () => { setStep('closed'); setDeleteInput(''); setConfirmInput(''); setError(null) }

  const handleFinalConfirm = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await api.post('/account/delete-request', { confirmDelete: deleteInput, confirmFinal: confirmInput })
      showToast('บัญชีถูกตั้งเวลาลบแล้ว คุณสามารถกู้คืนได้โดยเข้าสู่ระบบอีกครั้งภายใน 15 วัน', 'info')
      await logout()
    } catch (e: any) {
      setError(e?.response?.data?.message || 'ไม่สามารถลบบัญชีได้ กรุณาลองใหม่')
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-2xl border border-red-200 bg-red-50/40 p-6">
      <div className="flex items-center gap-2 text-red-700">
        <AlertTriangle className="h-5 w-5" />
        <h2 className="text-base font-semibold">ลบบัญชี</h2>
      </div>

      <div className="mt-3 space-y-1.5 text-sm text-gray-700">
        <p>เมื่อคุณลบบัญชี ระบบจะดำเนินการดังนี้:</p>
        <ul className="ml-4 list-disc space-y-1 text-gray-600">
          <li>บัญชีของคุณจะถูกตั้งเวลาสำหรับการลบ</li>
          <li>คุณสามารถกู้คืนบัญชีได้โดยเข้าสู่ระบบอีกครั้งภายใน 15 วัน</li>
          <li>หลังจาก 15 วัน บัญชีและข้อมูลที่เกี่ยวข้องอาจถูกลบถาวร</li>
          <li>การดำเนินการนี้จะมีผลต่อการเข้าถึงบัญชีและข้อมูลโปรไฟล์ที่เกี่ยวข้องทันที</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={() => setStep('type-delete')}
        className="mt-4 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
      >
        ลบบัญชี
      </button>

      {step !== 'closed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={close}>
          <div className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={close} aria-label="ปิด"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>

            {step === 'type-delete' && (
              <>
                <h3 className="flex items-center gap-2 text-base font-semibold text-red-700">
                  <AlertTriangle className="h-4 w-4" /> ยืนยันการลบบัญชี (ขั้นที่ 1/2)
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  การลบบัญชีจะจำกัดการเข้าถึงบัญชีและข้อมูลของคุณทันที และจะถูกลบถาวรหากไม่กู้คืนภายใน 15 วัน
                  พิมพ์ <span className="font-mono font-semibold">DELETE</span> เพื่อดำเนินการต่อ
                </p>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  placeholder="DELETE"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="mt-4 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm font-mono outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
                <div className="mt-5 flex gap-2">
                  <button type="button" onClick={close}
                    className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    disabled={deleteInput !== 'DELETE'}
                    onClick={() => setStep('type-confirm')}
                    className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-red-600"
                  >
                    ดำเนินการต่อ
                  </button>
                </div>
              </>
            )}

            {step === 'type-confirm' && (
              <>
                <h3 className="flex items-center gap-2 text-base font-semibold text-red-700">
                  <AlertTriangle className="h-4 w-4" /> ยืนยันครั้งสุดท้าย (ขั้นที่ 2/2)
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  นี่คือการยืนยันครั้งสุดท้าย บัญชีของคุณจะถูกตั้งเวลาลบทันทีหลังกดยืนยัน
                  พิมพ์ <span className="font-mono font-semibold">CONFIRM</span> เพื่อยืนยัน
                </p>
                <input
                  type="text"
                  value={confirmInput}
                  onChange={e => setConfirmInput(e.target.value)}
                  placeholder="CONFIRM"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="mt-4 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm font-mono outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
                {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
                <div className="mt-5 flex gap-2">
                  <button type="button" onClick={close} disabled={submitting}
                    className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                    ยกเลิก
                  </button>
                  <Button
                    type="button"
                    variant="danger"
                    disabled={confirmInput !== 'CONFIRM'}
                    isLoading={submitting}
                    onClick={handleFinalConfirm}
                    className="flex-1 disabled:opacity-40"
                  >
                    ลบบัญชีถาวร
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
