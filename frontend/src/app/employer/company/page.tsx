'use client'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Upload, X } from 'lucide-react'
import { api, API_ORIGIN } from '@/lib/api'
import { Input, Textarea, Select, Button, LoadingSpinner } from '@/components/ui'
import { CompanyLogo } from '@/components/company/CompanyLogo'

interface Profile {
  companyName: string; website: string; industry: string
  size: string; description: string; address: string; province: string; position: string
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_SIZE = 3 * 1024 * 1024

export default function CompanyProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const [companyName, setCompanyName] = useState('')
  const [logoUrl, setLogoUrl]   = useState<string | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [logoUploading, setLogoUploading]   = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const logoInputRef  = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset } = useForm<Profile>()

  const loadProfile = () =>
    api.get<{ profile: any }>('/employer/profile').then(r => {
      const p = r.data.profile
      reset({
        companyName: p.company?.name || '', website: p.company?.website || '',
        industry: p.company?.industry || '', size: p.company?.size || '',
        description: p.company?.description || '', address: p.company?.address || '',
        province: p.company?.province || '', position: p.position || '',
      })
      setCompanyName(p.company?.name || '')
      setLogoUrl(p.company?.logoUrl || null)
      setCoverUrl(p.company?.coverImageUrl || null)
    }).finally(() => setLoading(false))

  useEffect(() => { loadProfile() }, [reset])

  const onSubmit = async (values: Profile) => {
    setSaving(true); setSuccess(false); setError(null)
    try { await api.put('/employer/profile', values); setSuccess(true); setCompanyName(values.companyName) }
    catch (e: any) { setError(e?.response?.data?.message || 'บันทึกไม่สำเร็จ') }
    finally { setSaving(false) }
  }

  const handleUploadImage = async (field: 'logo' | 'cover', file: File) => {
    setImageError(null)
    if (!IMAGE_TYPES.includes(file.type)) { setImageError('รองรับเฉพาะไฟล์ JPEG, PNG, หรือ WEBP เท่านั้น'); return }
    if (file.size > MAX_IMAGE_SIZE) { setImageError('ขนาดไฟล์ต้องไม่เกิน 3MB'); return }

    const setUploading = field === 'logo' ? setLogoUploading : setCoverUploading
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post<{ profile: any }>(
        `/employer/profile/${field === 'logo' ? 'logo' : 'cover'}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      setLogoUrl(data.profile.company?.logoUrl || null)
      setCoverUrl(data.profile.company?.coverImageUrl || null)
    } catch (e: any) { setImageError(e?.response?.data?.message || 'อัปโหลดไม่สำเร็จ') }
    finally { setUploading(false) }
  }

  const handleRemoveImage = async (field: 'logo' | 'cover') => {
    setImageError(null)
    try {
      await api.put('/employer/profile', field === 'logo' ? { logoUrl: null } : { coverImageUrl: null })
      if (field === 'logo') setLogoUrl(null); else setCoverUrl(null)
    } catch (e: any) { setImageError(e?.response?.data?.message || 'ลบรูปไม่สำเร็จ') }
  }

  if (loading) return <div className="py-8"><LoadingSpinner /></div>

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">โปรไฟล์บริษัท</h1>

      <div className="mb-5 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {imageError && <div className="m-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{imageError}</div>}

        {/* Cover image */}
        <div className="relative h-32 w-full bg-gradient-to-r from-indigo-100 to-indigo-50 sm:h-40">
          {coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`${API_ORIGIN}${coverUrl}`} alt="" className="h-full w-full object-cover" />
          )}
          <div className="absolute bottom-3 right-3 flex gap-2">
            {coverUrl && (
              <button type="button" onClick={() => handleRemoveImage('cover')}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-gray-600 shadow hover:bg-white">
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={coverUploading}
              className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow hover:bg-white disabled:opacity-60"
            >
              <Upload className="h-3.5 w-3.5" />
              {coverUploading ? 'กำลังอัปโหลด...' : coverUrl ? 'เปลี่ยนภาพปก' : 'อัปโหลดภาพปก'}
            </button>
          </div>
          <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadImage('cover', f); e.target.value = '' }} />
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 px-5 pb-5 -mt-8 sm:flex-row sm:items-end sm:gap-4">
          <CompanyLogo name={companyName || '?'} logoUrl={logoUrl} size="lg"
            className="h-20 w-20 rounded-2xl text-3xl ring-4 ring-white sm:h-24 sm:w-24" />
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={logoUploading}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              <Upload className="h-3.5 w-3.5" />
              {logoUploading ? 'กำลังอัปโหลด...' : logoUrl ? 'เปลี่ยนโลโก้' : 'อัปโหลดโลโก้'}
            </button>
            {logoUrl && (
              <button type="button" onClick={() => handleRemoveImage('logo')}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50">
                <X className="h-3.5 w-3.5" />ลบโลโก้
              </button>
            )}
            <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadImage('logo', f); e.target.value = '' }} />
          </div>
        </div>
        <p className="px-5 pb-4 text-xs text-gray-400 sm:pl-[152px]">รองรับไฟล์ JPEG, PNG, WEBP ขนาดไม่เกิน 3MB</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
          {success && <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">บันทึกสำเร็จ</div>}
          {error   && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <Input label="ชื่อบริษัท *" {...register('companyName')} />
          <Input label="ตำแหน่งของคุณ" placeholder="HR Manager" {...register('position')} />
          <Input label="เว็บไซต์" type="url" placeholder="https://example.com" {...register('website')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="อุตสาหกรรม" placeholder="IT & Software" {...register('industry')} />
            <Select label="ขนาดบริษัท" {...register('size')}>
              <option value="">เลือกขนาด</option>
              {['1-10','11-50','51-200','201-500','500+'].map(s => <option key={s} value={s}>{s} คน</option>)}
            </Select>
          </div>
          <Textarea label="เกี่ยวกับบริษัท" rows={4} placeholder="แนะนำบริษัทและวัฒนธรรมองค์กร" {...register('description')} />
          <Input label="ที่อยู่" placeholder="เลขที่ ถนน ซอย..." {...register('address')} />
          <Input label="จังหวัด" placeholder="กรุงเทพมหานคร" {...register('province')} />
        </div>

        <div className="flex justify-end"><Button type="submit" isLoading={saving}>บันทึก</Button></div>
      </form>
    </main>
  )
}
