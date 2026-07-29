'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Input, Textarea, Select, Button } from '@/components/ui'
import { Resume } from '@/types'

const schema = z.object({
  title:     z.string().min(1, 'กรุณากรอกชื่อ Resume'),
  summary:   z.string().optional(),
  isPrimary: z.boolean().default(false),
  experiences: z.array(z.object({
    company:     z.string().min(1, 'กรุณากรอกชื่อบริษัท'),
    position:    z.string().min(1, 'กรุณากรอกตำแหน่ง'),
    startDate:   z.string().min(1, 'กรุณาเลือกวันเริ่มงาน'),
    endDate:     z.string().optional(),
    description: z.string().optional(),
  })).default([]),
  educations: z.array(z.object({
    institution: z.string().min(1, 'กรุณากรอกสถาบัน'),
    degree:      z.string().min(1, 'กรุณากรอกวุฒิการศึกษา'),
    field:       z.string().optional(),
    startDate:   z.string().min(1, 'กรุณาเลือกวันเริ่มศึกษา'),
    endDate:     z.string().optional(),
  })).default([]),
  skills: z.array(z.object({
    skillName: z.string().min(1, 'กรุณากรอกชื่อทักษะ'),
    level:     z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  })).default([]),
  languages: z.array(z.object({ language: z.string().min(1), level: z.string().min(1) })).default([]),
})
type FormValues = z.infer<typeof schema>

const dateToInput = (iso?: string | null) => iso ? iso.slice(0, 10) : ''
const inputToIso  = (d: string) => d ? new Date(`${d}T00:00:00Z`).toISOString() : undefined

export default function ResumeForm({ initialResume }: { initialResume?: Resume }) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const isEditing = Boolean(initialResume)

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialResume ? {
      title: initialResume.title, summary: initialResume.summary || '', isPrimary: initialResume.isPrimary,
      experiences: (initialResume.experiences as any[]).map(e => ({ ...e, startDate: dateToInput(e.startDate), endDate: dateToInput(e.endDate) })),
      educations:  (initialResume.educations  as any[]).map(e => ({ ...e, startDate: dateToInput(e.startDate), endDate: dateToInput(e.endDate) })),
      skills:    initialResume.skills    as any[],
      languages: initialResume.languages as any[],
    } : { title: '', summary: '', isPrimary: false, experiences: [], educations: [], skills: [], languages: [] },
  })

  const expArray   = useFieldArray({ control, name: 'experiences' })
  const eduArray   = useFieldArray({ control, name: 'educations' })
  const skillArray = useFieldArray({ control, name: 'skills' })
  const langArray  = useFieldArray({ control, name: 'languages' })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    const payload = {
      ...values,
      experiences: values.experiences.map(e => ({ ...e, startDate: inputToIso(e.startDate), endDate: e.endDate ? inputToIso(e.endDate) : undefined })),
      educations:  values.educations.map(e => ({ ...e, startDate: inputToIso(e.startDate), endDate: e.endDate ? inputToIso(e.endDate) : undefined })),
    }
    try {
      if (isEditing && initialResume) await api.put(`/seeker/resumes/${initialResume.id}`, payload)
      else await api.post('/seeker/resumes', payload)
      router.push('/seeker/resumes')
    } catch (e: any) { setServerError(e?.response?.data?.message || 'บันทึกไม่สำเร็จ') }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {serverError && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">ข้อมูลทั่วไป</h2>
        <Input label="ชื่อ Resume *" placeholder="เช่น Resume สายงาน Frontend Developer" error={errors.title?.message} {...register('title')} />
        <Textarea label="สรุปตัวเอง" rows={3} placeholder="แนะนำประสบการณ์และจุดเด่นสั้น ๆ" {...register('summary')} />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" className="rounded border-gray-300" {...register('isPrimary')} />
          ตั้งเป็น Resume หลัก
        </label>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">ประสบการณ์ทำงาน</h2>
          <Button type="button" variant="secondary" size="sm"
            onClick={() => expArray.append({ company:'', position:'', startDate:'', endDate:'', description:'' })}>
            <Plus className="h-3.5 w-3.5" />เพิ่ม
          </Button>
        </div>
        {expArray.fields.length === 0 && <p className="text-sm text-gray-400">ยังไม่มีประสบการณ์</p>}
        {expArray.fields.map((field, i) => (
          <div key={field.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <Input label="บริษัท *" error={errors.experiences?.[i]?.company?.message} {...register(`experiences.${i}.company`)} />
                <Input label="ตำแหน่ง *" error={errors.experiences?.[i]?.position?.message} {...register(`experiences.${i}.position`)} />
              </div>
              <button type="button" onClick={() => expArray.remove(i)} className="mt-7 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="วันเริ่มงาน *" type="date" error={errors.experiences?.[i]?.startDate?.message} {...register(`experiences.${i}.startDate`)} />
              <Input label="วันสิ้นสุด" type="date" {...register(`experiences.${i}.endDate`)} />
            </div>
            <Textarea label="รายละเอียด" rows={2} {...register(`experiences.${i}.description`)} />
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">การศึกษา</h2>
          <Button type="button" variant="secondary" size="sm"
            onClick={() => eduArray.append({ institution:'', degree:'', field:'', startDate:'', endDate:'' })}>
            <Plus className="h-3.5 w-3.5" />เพิ่ม
          </Button>
        </div>
        {eduArray.fields.length === 0 && <p className="text-sm text-gray-400">ยังไม่มีข้อมูลการศึกษา</p>}
        {eduArray.fields.map((field, i) => (
          <div key={field.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <Input label="สถาบัน *" error={errors.educations?.[i]?.institution?.message} {...register(`educations.${i}.institution`)} />
                <Input label="วุฒิการศึกษา *" error={errors.educations?.[i]?.degree?.message} {...register(`educations.${i}.degree`)} />
              </div>
              <button type="button" onClick={() => eduArray.remove(i)} className="mt-7 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <Input label="สาขาวิชา" {...register(`educations.${i}.field`)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="วันเริ่มศึกษา *" type="date" error={errors.educations?.[i]?.startDate?.message} {...register(`educations.${i}.startDate`)} />
              <Input label="วันจบการศึกษา" type="date" {...register(`educations.${i}.endDate`)} />
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">ทักษะ</h2>
          <Button type="button" variant="secondary" size="sm" onClick={() => skillArray.append({ skillName:'', level:'intermediate' })}>
            <Plus className="h-3.5 w-3.5" />เพิ่ม
          </Button>
        </div>
        {skillArray.fields.length === 0 && <p className="text-sm text-gray-400">ยังไม่มีทักษะ</p>}
        {skillArray.fields.map((field, i) => (
          <div key={field.id} className="flex items-end gap-3">
            <div className="flex-1">
              <Input label="ชื่อทักษะ" placeholder="เช่น React, การเจรจาต่อรอง" error={errors.skills?.[i]?.skillName?.message} {...register(`skills.${i}.skillName`)} />
            </div>
            <div className="w-40">
              <Select label="ระดับ" {...register(`skills.${i}.level`)}>
                <option value="beginner">เริ่มต้น</option>
                <option value="intermediate">ปานกลาง</option>
                <option value="advanced">ชำนาญ</option>
                <option value="expert">เชี่ยวชาญ</option>
              </Select>
            </div>
            <button type="button" onClick={() => skillArray.remove(i)} className="mb-0.5 rounded-lg p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">ภาษา</h2>
          <Button type="button" variant="secondary" size="sm" onClick={() => langArray.append({ language:'', level:'' })}>
            <Plus className="h-3.5 w-3.5" />เพิ่ม
          </Button>
        </div>
        {langArray.fields.map((field, i) => (
          <div key={field.id} className="flex items-end gap-3">
            <div className="flex-1"><Input label="ภาษา" placeholder="ภาษาไทย, English" {...register(`languages.${i}.language`)} /></div>
            <div className="flex-1"><Input label="ระดับ" placeholder="Native, Fluent, Intermediate" {...register(`languages.${i}.level`)} /></div>
            <button type="button" onClick={() => langArray.remove(i)} className="mb-0.5 rounded-lg p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </section>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.push('/seeker/resumes')}>ยกเลิก</Button>
        <Button type="submit" isLoading={isSubmitting}>{isEditing ? 'บันทึกการแก้ไข' : 'สร้าง Resume'}</Button>
      </div>
    </form>
  )
}
