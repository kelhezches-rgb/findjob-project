import type { Metadata } from 'next'
import { ToastProvider } from '@/components/ui/toast'
import { AuthProvider } from '@/components/auth/AuthProvider'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jobboard.example.com'
const SITE_NAME = 'JobBoard'
const SITE_DESCRIPTION = 'แพลตฟอร์มหางานและสรรหาบุคลากรชั้นนำของไทย ค้นหางาน สร้าง Resume และเชื่อมต่อกับนายจ้างได้ในที่เดียว'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — หางาน หาคน`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — หางาน หาคน`,
    description: SITE_DESCRIPTION,
    locale: 'th_TH',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — หางาน หาคน`,
    description: SITE_DESCRIPTION,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="antialiased">
        <a href="#main-content" className="skip-link">ข้ามไปยังเนื้อหาหลัก</a>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
