'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { Input, Textarea, Select, Button } from '@/components/ui'
import { useCategories } from '@/hooks'
import { groupCategories } from '@/lib/categories'
import { Job } from '@/types'

const schema = z.object({
  title:           z.string().min(1, 'กรุณากรอกชื่อตำแหน่ง'),
  description:     z.string().min(1, 'กรุณากรอกรายละเอียด'),
  requirements:    z.string().optional(),
  benefits:        z.string().optional(),
  location:        z.string().optional(),
  province:        z.string().optional(),
  isRemote:        z.boolean().default(false),
  jobType:         z.enum(['full_time', 'part_time', 'contract', 'internship', 'remote']),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']).optional(),
  categoryId:      z.string().optional(),
  // COMPANY_STRUCTURE = "ตามโครงสร้างบริษัท": salary follows the company's
  // own pay scale instead of a posted numeric range. See lib/salary.ts.
  salaryType:      z.enum(['RANGE', 'COMPANY_STRUCTURE']).default('RANGE'),
  salaryMin:       z.string().optional(),
  salaryMax:       z.string().optional(),
  status:          z.enum(['draft', 'active']).default('draft'),
  expiresAt:       z.string().optional(),
})
type FormValues = z.infer<typeof schema>

export default function JobPostForm({ initialJob }: { initialJob?: Job }) {
  const router = useRouter()
  const { categories } = useCategories()
  const categoryGroups = groupCategories(categories)
  const [serverError, setServerError] = useState<string | null>(null)
  const isEditing = Boolean(initialJob)

  const { register, handleSubmit, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialJob ? {
      title: initialJob.title, description: initialJob.description,
      requirements: initialJob.requirements || '', benefits: initialJob.benefits || '',
      location: initialJob.location || '', province: initialJob.province || '',
      isRemote: initialJob.isRemote, jobType: initialJob.jobType,
      experienceLevel: initialJob.experienceLevel || undefined,
      categoryId: initialJob.categoryId || '',
      salaryType: initialJob.salaryType || 'RANGE',
      salaryMin: initialJob.salaryMin ? String(initialJob.salaryMin) : '',
      salaryMax: initialJob.salaryMax ? String(initialJob.salaryMax) : '',
      status: initialJob.status === 'closed' || initialJob.status === 'expired' ? 'draft' : initialJob.status,
      expiresAt: initialJob.expiresAt ? initialJob.expiresAt.slice(0, 10) : '',
    } : {
      title: '', description: '', requirements: '', benefits: '',
      location: '', province: '', isRemote: false, jobType: 'full_time',
      categoryId: '', salaryType: 'RANGE', salaryMin: '', salaryMax: '', status: 'draft', expiresAt: '',
    },
  })

  const salaryType = watch('salaryType')
  const isCompanyStructure = salaryType === 'COMPANY_STRUCTURE'

  // Requirement 2: clear any previously entered numeric salary values the
  // moment the employer switches to COMPANY_STRUCTURE, so a value typed
  // before switching can't accidentally get resubmitted later.
  const handleSalaryTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as FormValues['salaryType']
    setValue('salaryType', next)
    if (next === 'COMPANY_STRUCTURE') {
      setValue('salaryMin', '')
      setValue('salaryMax', '')
    }
  }

  const submitJob = async (values: FormValues, statusOverride?: 'draft' | 'active') => {
    setServerError(null)
    const payload = {
      ...values,
      salaryMin:  values.salaryType === 'COMPANY_STRUCTURE' ? undefined : (values.salaryMin ? Number(values.salaryMin) : undefined),
      salaryMax:  values.salaryType === 'COMPANY_STRUCTURE' ? undefined : (values.salaryMax ? Number(values.salaryMax) : undefined),
      categoryId: values.categoryId || undefined,
      expiresAt:  values.expiresAt ? new Date(`${values.expiresAt}T23:59:59Z`).toISOString() : undefined,
      status:     statusOverride ?? values.status,
    }
    try {
      if (isEditing && initialJob) await api.put(`/employer/jobs/${initialJob.id}`, payload)
      else await api.post('/employer/jobs', payload)
      router.push('/employer/jobs')
    } catch (e: any) { setServerError(e?.response?.data?.message || 'บันทึกไม่สำเร็จ') }
  }

  const [savingDraft, setSavingDraft] = useState(false)
  const [publishing, setPublishing]   = useState(false)

  const onDraft   = handleSubmit(async v => { setSavingDraft(true);  await submitJob(v, 'draft');  setSavingDraft(false) })
  const onPublish = handleSubmit(async v => { setPublishing(true); await submitJob(v, 'active'); setPublishing(false) })

  return (
    <form className="flex flex-col gap-6">
      {serverError && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">รายละเอียดตำแหน่งงาน</h2>
        <Input label="ชื่อตำแหน่งงาน *" placeholder="เช่น Frontend Developer" {...register('title')} />
        <Textarea label="รายละเอียดงาน *" rows={6} placeholder="อธิบายหน้าที่ความรับผิดชอบ..." {...register('description')} />
        <Textarea label="คุณสมบัติที่ต้องการ" rows={4} placeholder="ประสบการณ์ ทักษะ..." {...register('requirements')} />
        <Textarea label="สวัสดิการ" rows={3} placeholder="โบนัส, ประกัน, อาหารกลางวัน..." {...register('benefits')} />
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">รูปแบบงานและสถานที่</h2>
        <div className="grid grid-cols-2 gap-3">
          <Select label="ประเภทงาน *" {...register('jobType')}>
            <option value="full_time">งานประจำ</option>
            <option value="part_time">พาร์ทไทม์</option>
            <option value="contract">สัญญาจ้าง</option>
            <option value="internship">ฝึกงาน</option>
            <option value="remote">ทำงานทางไกล</option>
          </Select>
          <Select label="ระดับประสบการณ์" {...register('experienceLevel')}>
            <option value="">ไม่ระบุ</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
            <option value="executive">Executive</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="สถานที่ทำงาน" placeholder="เช่น อาคาร X ชั้น Y" {...register('location')} />
          <Input label="จังหวัด" placeholder="กรุงเทพมหานคร" {...register('province')} />
        </div>
        <Select label="หมวดหมู่" {...register('categoryId')}>
          <option value="">ไม่ระบุ</option>
          {categoryGroups.map(g => (
            <optgroup key={g.group} label={g.group}>
              {g.categories.map(c => <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>)}
            </optgroup>
          ))}
        </Select>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" className="rounded border-gray-300" {...register('isRemote')} />
          รองรับทำงานทางไกล (Remote)
        </label>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">เงินเดือนและวันหมดอายุ</h2>
        <Select label="รูปแบบเงินเดือน" value={salaryType} onChange={handleSalaryTypeChange}>
          <option value="RANGE">ระบุช่วงเงินเดือน</option>
          <option value="COMPANY_STRUCTURE">ตามโครงสร้างบริษัท</option>
        </Select>
        {isCompanyStructure ? (
          <p className="rounded-lg bg-gray-50 px-3.5 py-2.5 text-sm text-gray-500">
            ประกาศงานนี้จะแสดงเงินเดือนเป็น &ldquo;ตามโครงสร้างบริษัท&rdquo; แทนช่วงตัวเลข
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Input label="เงินเดือนต่ำสุด (บาท)" type="number" placeholder="30000" {...register('salaryMin')} />
            <Input label="เงินเดือนสูงสุด (บาท)" type="number" placeholder="60000" {...register('salaryMax')} />
          </div>
        )}
        <Input label="วันหมดอายุประกาศ" type="date" {...register('expiresAt')} />
      </section>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.push('/employer/jobs')}>ยกเลิก</Button>
        <Button type="button" variant="secondary" isLoading={savingDraft} onClick={onDraft}>บันทึกร่าง</Button>
        <Button type="button" isLoading={publishing} onClick={onPublish}>{isEditing ? 'บันทึกและเผยแพร่' : 'เผยแพร่ประกาศงาน'}</Button>
      </div>
    </form>
  )
}
