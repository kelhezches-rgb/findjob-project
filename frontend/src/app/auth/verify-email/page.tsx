'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui'

type State = 'loading' | 'success' | 'error' | 'notoken'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [state, setState] = useState<State>(token ? 'loading' : 'notoken')
  const [message, setMessage] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resendSent, setResendSent] = useState(false)

  useEffect(() => {
    if (!token) return
    api.post('/auth/verify-email', { token })
      .then(() => { setState('success'); setTimeout(() => router.push('/auth/login'), 3000) })
      .catch(e => { setState('error'); setMessage(e?.response?.data?.message || 'ลิงก์ยืนยันไม่ถูกต้องหรือหมดอายุแล้ว') })
  }, [token, router])

  const handleResend = async () => {
    if (!resendEmail) return
    setResending(true)
    try { await api.post('/auth/resend-verification', { email: resendEmail }); setResendSent(true) }
    catch (e: any) { setMessage(e?.response?.data?.message || 'ส่งอีเมลไม่สำเร็จ') }
    finally { setResending(false) }
  }

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">

          {state === 'loading' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">กำลังยืนยันอีเมล...</h1>
              <p className="mt-2 text-sm text-gray-500">กรุณารอสักครู่</p>
            </>
          )}

          {state === 'success' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">ยืนยันอีเมลสำเร็จ!</h1>
              <p className="mt-2 text-sm text-gray-500">บัญชีของคุณพร้อมใช้งานแล้ว กำลังพาไปยังหน้าเข้าสู่ระบบ...</p>
              <div className="mt-6"><Link href="/auth/login"><Button className="w-full">เข้าสู่ระบบ</Button></Link></div>
            </>
          )}

          {state === 'error' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">ยืนยันไม่สำเร็จ</h1>
              <p className="mt-2 text-sm text-gray-500">{message}</p>

              <div className="mt-6 flex flex-col gap-3">
                <p className="text-sm text-gray-600 font-medium">ขอส่งอีเมลยืนยันใหม่</p>
                {resendSent ? (
                  <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                    ส่งอีเมลยืนยันแล้ว กรุณาตรวจกล่องข้อความของคุณ
                  </div>
                ) : (
                  <>
                    <input type="email" value={resendEmail} onChange={e => setResendEmail(e.target.value)}
                      placeholder="กรอกอีเมลของคุณ"
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                    <Button onClick={handleResend} isLoading={resending} className="w-full">ส่งอีเมลยืนยันใหม่</Button>
                  </>
                )}
                <Link href="/auth/login" className="text-sm text-indigo-600 hover:underline">กลับหน้าเข้าสู่ระบบ</Link>
              </div>
            </>
          )}

          {state === 'notoken' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                <XCircle className="h-8 w-8 text-amber-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">ลิงก์ไม่ถูกต้อง</h1>
              <p className="mt-2 text-sm text-gray-500">ลิงก์ยืนยันอีเมลนี้ไม่ถูกต้อง กรุณาตรวจสอบอีเมลของคุณอีกครั้ง</p>
              <div className="mt-6"><Link href="/auth/login"><Button variant="secondary" className="w-full">กลับหน้าเข้าสู่ระบบ</Button></Link></div>
            </>
          )}

        </div>
      </div>
    </main>
  )
}
