'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { Input, Button } from '@/components/ui'

const schema = z.object({
  role:        z.enum(['seeker', 'employer']),
  email:       z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password:    z.string().min(8, 'อย่างน้อย 8 ตัวอักษร'),
  confirmPassword: z.string().min(1, 'กรุณายืนยันรหัสผ่าน'),
  firstName:   z.string().optional(),
  lastName:    z.string().optional(),
  companyName: z.string().optional(),
}).superRefine((d, ctx) => {
  if (d.password !== d.confirmPassword)
    ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'รหัสผ่านไม่ตรงกัน' })
  if (d.role === 'seeker') {
    if (!d.firstName) ctx.addIssue({ code: 'custom', path: ['firstName'], message: 'กรุณากรอกชื่อ' })
    if (!d.lastName)  ctx.addIssue({ code: 'custom', path: ['lastName'],  message: 'กรุณากรอกนามสกุล' })
  }
  if (d.role === 'employer' && !d.companyName)
    ctx.addIssue({ code: 'custom', path: ['companyName'], message: 'กรุณากรอกชื่อบริษัท' })
})
type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'seeker' },
  })
  const role = watch('role')
  const password = watch('password') || ''

  const getStrength = (p: string) => {
    let s = 0
    if (p.length >= 8) s++
    if (p.length >= 12) s++
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
    if (/\d/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }
  const strength = getStrength(password)
  const strengthColors = ['', 'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-lime-500', 'bg-green-500']
  const strengthLabels = ['', 'อ่อนมาก', 'อ่อน', 'ปานกลาง', 'แข็งแรง', 'แข็งแรงมาก']

  const onSubmit = async ({ confirmPassword, role, email, password, firstName, lastName, companyName }: FormValues) => {
    setServerError(null)
    // React Hook Form retains values from fields that are conditionally hidden.
    // Only send fields that belong to the selected role; otherwise an employer
    // registration includes empty first/last names and fails backend validation.
    const input = role === 'seeker'
      ? { role, email, password, firstName: firstName || '', lastName: lastName || '' }
      : { role, email, password, companyName: companyName || '' }
    const result = await registerUser(input)
    if (!result.success) setServerError(result.message)
  }

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white">J</Link>
          <h1 className="text-2xl font-bold text-gray-900">สมัครสมาชิก</h1>
          <p className="mt-1 text-sm text-gray-500">เริ่มต้นค้นหางาน หรือประกาศรับสมัครงานวันนี้</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {serverError && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>}

            <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-gray-100 p-1">
              {(['seeker', 'employer'] as const).map(r => (
                <label key={r} className={`cursor-pointer rounded-lg py-2 text-center text-sm font-medium transition-colors
                  ${role === r ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  <input type="radio" value={r} className="hidden" {...register('role')} />
                  {r === 'seeker' ? '👤 ผู้หางาน' : '🏢 ผู้ประกอบการ'}
                </label>
              ))}
            </div>

            <Input label="อีเมล" type="email" placeholder="you@example.com"
              error={errors.email?.message} {...register('email')} />

            {role === 'seeker' ? (
              <div className="grid grid-cols-2 gap-3">
                <Input label="ชื่อ"    error={errors.firstName?.message} {...register('firstName')} />
                <Input label="นามสกุล" error={errors.lastName?.message}  {...register('lastName')} />
              </div>
            ) : (
              <Input label="ชื่อบริษัท" placeholder="บริษัท ตัวอย่าง จำกัด"
                error={errors.companyName?.message} {...register('companyName')} />
            )}

            <div className="flex flex-col gap-1.5">
              <Input label="รหัสผ่าน" type="password" placeholder="อย่างน้อย 8 ตัวอักษร"
                error={errors.password?.message} {...register('password')} />
              {password && (
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{strengthLabels[strength]}</span>
                </div>
              )}
            </div>

            <Input label="ยืนยันรหัสผ่าน" type="password" placeholder="กรอกอีกครั้ง"
              error={errors.confirmPassword?.message} {...register('confirmPassword')} />

            <Button type="submit" isLoading={isSubmitting} className="w-full">สมัครสมาชิก</Button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-600">
            มีบัญชีแล้ว?{' '}
            <Link href="/auth/login" className="font-medium text-indigo-600 hover:underline">เข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
