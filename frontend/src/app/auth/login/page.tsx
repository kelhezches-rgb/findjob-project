'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { Input, Button } from '@/components/ui'

const schema = z.object({
  email:    z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
})
type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const { login } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    const result = await login(values.email, values.password)
    if (!result.success) setServerError(result.message)
  }

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white">J</Link>
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
