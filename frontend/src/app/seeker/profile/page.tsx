'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { api } from '@/lib/api'
import { Input, Textarea, Button, LoadingSpinner } from '@/components/ui'

interface Profile {
  firstName: string; lastName: string
  phone: string; headline: string; bio: string
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const { register, handleSubmit, reset } = useForm<Profile>()

  useEffect(() => {
    api.get<{ profile: Profile }>('/seeker/profile')
      .then(r => reset(r.data.profile))
      .finally(() => setLoading(false))
  }, [reset])

  const onSubmit = async (values: Profile) => {
    setSaving(true); setSuccess(false); setError(null)
    try { await api.put('/seeker/profile', values); setSuccess(true) }
    catch (e: any) { setError(e?.response?.data?.message || 'บันทึกไม่สำเร็จ') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="py-8"><LoadingSpinner /></div>

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">โปรไฟล์ของฉัน</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
          {success && <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">บันทึกสำเร็จ</div>}
          {error   && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <Input label="ชื่อ" {...register('firstName')} />
            <Input label="นามสกุล" {...register('lastName')} />
          </div>
          <Input label="เบอร์โทรศัพท์" type="tel" placeholder="0812345678" {...register('phone')} />
          <Input label="Headline" placeholder="เช่น Full-stack Developer 3 ปี" {...register('headline')} />
          <Textarea label="เกี่ยวกับฉัน" rows={4} placeholder="แนะนำตัวเองสั้น ๆ" {...register('bio')} />
        </div>

        <div className="flex justify-end">
          <Button type="submit" isLoading={saving}>บันทึก</Button>
        </div>
      </form>
    </main>
  )
}
