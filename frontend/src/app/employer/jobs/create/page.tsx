import JobPostForm from '@/components/employer/JobPostForm'

export default function CreateJobPage() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">ลงประกาศงานใหม่</h1>
        <p className="text-sm text-gray-500">กรอกรายละเอียด แล้วเลือกบันทึกร่างหรือเผยแพร่ทันที</p>
      </div>
      <JobPostForm />
    </main>
  )
}
