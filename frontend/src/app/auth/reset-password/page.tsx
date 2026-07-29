'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { Input, Button } from '@/components/ui'

const schema = z
  .object({ password: z.string().min(8, 'อย่างน้อย 8 ตัวอักษร'), confirmPassword: z.string().min(1, 'กรุณายืนยันรหัสผ่าน') })
  .refine(d => d.password === d.confirmPassword, { message: 'รหัสผ่านไม่ตรงกัน', path: ['confirmPassword'] })
type FormValues = z.infer<typeof schema>

const getStrength = (p: string) => {
  let s = 0
  if (p.length >= 8) s++
  if (p.length >= 12) s++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
  if (/\d/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
}
const COLORS = ['', 'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-lime-500', 'bg-green-500']
const LABELS = ['', 'อ่อนมาก', 'อ่อน', 'ปานกลาง', 'แข็งแรง', 'แข็งแรงมาก']

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })
  const password = watch('password') || ''
  const strength  = getStrength(password)

  if (!token) {
    return (
      <main id="main-content" className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">ลิงก์ไม่ถูกต้อง</h1>
          <p className="mt-2 text-sm text-gray-500">ลิงก์รีเซ็ตรหัสผ่านนี้ไม่ถูกต้องหรือหมดอายุแล้ว</p>
          <div className="mt-6">
            <Link href="/auth/forgot-password"><Button className="w-full">ขอลิงก์ใหม่</Button></Link>
          </div>
        </div>
      </main>
    )
  }

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">รีเซ็ตสำเร็จ!</h1>
          <p className="mt-2 text-sm text-gray-500">รหัสผ่านของคุณถูกเปลี่ยนแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่</p>
          <div className="mt-6">
            <Link href="/auth/login"><Button className="w-full">เข้าสู่ระบบ</Button></Link>
          </div>
        </div>
      </main>
    )
  }

  const onSubmit = async ({ password }: FormValues) => {
    setServerError(null)
    try {
      await api.post('/auth/reset-password', { token, password })
      setDone(true)
    } catch (e: any) {
      setServerError(e?.response?.data?.message || 'รีเซ็ตรหัสผ่านไม่สำเร็จ')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white">J</div>
            <h1 className="text-xl font-bold text-gray-900">ตั้งรหัสผ่านใหม่</h1>
            <p className="mt-1 text-sm text-gray-500">กรอกรหัสผ่านใหม่ที่ต้องการใช้</p>
          </div>

          {serverError && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Input label="รหัสผ่านใหม่" type="password" placeholder="อย่างน้อย 8 ตัวอักษร"
                autoComplete="new-password" error={errors.password?.message} {...register('password')} />
              {password && (
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? COLORS[strength] : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{LABELS[strength]}</span>
                </div>
              )}
            </div>

            <Input label="ยืนยันรหัสผ่านใหม่" type="password" placeholder="กรอกอีกครั้ง"
              autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

            <Button type="submit" isLoading={isSubmitting} className="w-full">ตั้งรหัสผ่านใหม่</Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            <Link href="/auth/login" className="text-indigo-600 hover:underline">กลับหน้าเข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
