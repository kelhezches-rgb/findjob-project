import ResumeForm from '@/components/resume/ResumeForm'

export default function CreateResumePage() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">สร้าง Resume ใหม่</h1>
        <p className="text-sm text-gray-500">กรอกข้อมูลเพื่อสร้าง Resume สำหรับสมัครงาน</p>
      </div>
      <ResumeForm />
    </main>
  )
}
