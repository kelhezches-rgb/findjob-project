'use client'
import { useAuth } from '@/hooks/useAuth'
import { DeleteAccountSection } from '@/components/account/DeleteAccountSection'

export default function SeekerAccountSettingsPage() {
  const { user } = useAuth()

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-xl font-bold text-gray-900">การตั้งค่าบัญชี</h1>
      <p className="mb-6 text-sm text-gray-500">{user?.email}</p>

      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">บัญชีของฉัน</h2>
          <p className="mt-1 text-sm text-gray-500">
            ต้องการแก้ไขข้อมูลโปรไฟล์? ไปที่{' '}
            <a href="/seeker/profile" className="text-indigo-600 hover:underline">โปรไฟล์ของฉัน</a>
          </p>
        </div>

        <DeleteAccountSection />
      </div>
    </main>
  )
}
