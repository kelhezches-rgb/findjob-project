'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertTriangle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Input, Button } from '@/components/ui'
import { Logo } from '@/components/brand/Logo'

const schema = z.object({
  email:    z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
})
type FormValues = z.infer<typeof schema>

interface PendingRecovery {
  deletionScheduledAt: string
  recoveryToken: string
}

export default function LoginPage() {
  const { login, recoverAccount } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [pendingRecovery, setPendingRecovery] = useState<PendingRecovery | null>(null)
  const [recovering, setRecovering] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    const result = await login(values.email, values.password)
    if (result.success) return
    if (result.requiresAccountRecovery) {
      setPendingRecovery({ deletionScheduledAt: result.deletionScheduledAt, recoveryToken: result.recoveryToken })
      return
    }
    setServerError(result.message)
  }

  const handleRestore = async () => {
    if (!pendingRecovery) return
    setRecovering(true)
    const result = await recoverAccount(pendingRecovery.recoveryToken)
    setRecovering(false)
    if (!result.success) setServerError(result.message)
  }

  // "ดำเนินการลบบัญชีต่อ" — no API call needed: the account is already
  // PENDING_DELETION (that's why we're here), so simply not recovering it
  // and sending the user back to a public page is the entire action.
  const handleProceedWithDeletion = () => {
    setPendingRecovery(null)
    window.location.href = '/'
  }

  if (pendingRecovery) {
    const scheduledDate = new Date(pendingRecovery.deletionScheduledAt).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
    return (
      <main id="main-content" className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Logo variant="lockup" href="/" className="mx-auto mb-4" imgClassName="h-12" priority />
          </div>
          <div className="rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <h1 className="text-lg font-bold">บัญชีนี้อยู่ระหว่างกำหนดลบ</h1>
            </div>
            <p className="text-sm leading-relaxed text-gray-600">
              บัญชีนี้ถูกตั้งเวลาให้ลบและมีกำหนดลบถาวรในวันที่{' '}
              <span className="font-semibold text-gray-900">{scheduledDate}</span>
              {' '}คุณสามารถกู้คืนบัญชีนี้ได้ก่อนถึงกำหนดเวลาดังกล่าว
            </p>
            {serverError && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>}
            <div className="mt-6 flex flex-col gap-2.5">
              <Button onClick={handleRestore} isLoading={recovering} className="w-full">กู้คืนบัญชี</Button>
              <button
                type="button"
                onClick={handleProceedWithDeletion}
                className="w-full rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                ดำเนินการลบบัญชีต่อ
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo variant="lockup" href="/" className="mx-auto mb-4" imgClassName="h-12" priority />
          <h1 className="text-2xl font-bold text-gray-900">เข้าสู่ระบบ</h1>
          <p className="mt-1 text-sm text-gray-500">ยินดีต้อนรับกลับ JobBoard</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {serverError && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>}
            <Input label="อีเมล" type="email" placeholder="you@example.com"
              autoComplete="email" error={errors.email?.message} {...register('email')} />
            <Input label="รหัสผ่าน" type="password" placeholder="••••••••"
              autoComplete="current-password" error={errors.password?.message} {...register('password')} />
            <Button type="submit" isLoading={isSubmitting} className="w-full">เข้าสู่ระบบ</Button>
          </form>

          <p className="mt-3 text-right text-xs">
            <Link href="/auth/forgot-password" className="text-indigo-600 hover:underline">ลืมรหัสผ่าน?</Link>
          </p>

          <p className="mt-5 text-center text-sm text-gray-600">
            ยังไม่มีบัญชี?{' '}
            <Link href="/auth/register" className="font-medium text-indigo-600 hover:underline">สมัครสมาชิก</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
