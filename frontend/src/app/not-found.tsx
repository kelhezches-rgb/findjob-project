import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-50">
          <span className="text-5xl font-extrabold text-indigo-200">404</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบหน้าที่คุณต้องการ</h1>
        <p className="text-sm text-gray-500 mb-8">หน้านี้อาจถูกย้าย ลบ หรือลิงก์ไม่ถูกต้อง</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
            กลับหน้าหลัก
          </Link>
          <Link href="/jobs" className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            ค้นหางาน
          </Link>
        </div>
      </div>
    </main>
  )
}
