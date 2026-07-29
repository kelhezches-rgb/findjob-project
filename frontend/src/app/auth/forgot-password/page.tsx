'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { Input, Button } from '@/components/ui'

const schema = z.object({ email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง') })
type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email }: FormValues) => {
    await api.post('/auth/forgot-password', { email }).catch(() => {})
    setSentEmail(email)
    setSent(true)
  }

  if (sent) {
    return (
      <main id="main-content" className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">ตรวจสอบอีเมลของคุณ</h1>
            <p className="mt-2 text-sm text-gray-500">
              ถ้า <span className="font-medium text-gray-700">{sentEmail}</span> มีบัญชีอยู่ในระบบ
              เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปแล้ว
            </p>
            <p className="mt-3 text-xs text-gray-400">ลิงก์จะหมดอายุใน 1 ชั่วโมง</p>
            <div className="mt-6 flex flex-col gap-3">
              <button onClick={() => setSent(false)} className="text-sm text-indigo-600 hover:underline">ใช้อีเมลอื่น</button>
              <Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-700">กลับหน้าเข้าสู่ระบบ</Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/auth/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" /> กลับหน้าเข้าสู่ระบบ
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white">J</div>
            <h1 className="text-xl font-bold text-gray-900">ลืมรหัสผ่าน?</h1>
            <p className="mt-1 text-sm text-gray-500">กรอกอีเมลที่ใช้สมัครสมาชิก เราจะส่งลิงก์รีเซ็ตให้คุณ</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input label="อีเมล" type="email" placeholder="you@example.com"
              autoComplete="email" error={errors.email?.message} {...register('email')} />
            <Button type="submit" isLoading={isSubmitting} className="w-full">ส่งลิงก์รีเซ็ตรหัสผ่าน</Button>
          </form>
        </div>
      </div>
    </main>
  )
}
