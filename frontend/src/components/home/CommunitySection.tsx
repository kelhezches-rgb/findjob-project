'use client'
import { useState } from 'react'
import { Facebook, Share2, Users, Check } from 'lucide-react'
import { useRevealOnScroll } from './useRevealOnScroll'

const FACEBOOK_GROUP_URL = 'https://facebook.com/groups/jobboard.community'

export function CommunitySection() {
  const { ref, isVisible } = useRevealOnScroll()
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const shareData = {
      title: 'JobBoard — หางานที่ใช่ ได้ง่ายกว่าเดิม',
      text: 'มาดูตำแหน่งงานเปิดรับสมัครใหม่ ๆ ได้ที่ JobBoard',
      url: typeof window !== 'undefined' ? `${window.location.origin}/jobs` : '',
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share(shareData); return } catch { /* user cancelled — no-op */ }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareData.url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch { /* clipboard unavailable — no-op */ }
    }
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-indigo-50 p-6 transition-all duration-500 sm:p-10 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1877F2] text-white">
                <Facebook className="h-6 w-6" />
              </span>
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#4F46E5]">
                  <Users className="h-3.5 w-3.5" /> ชุมชนของเรา
                </p>
                <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">JobBoard Community</h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-600">
                  พูดคุยเรื่องสายอาชีพ แบ่งปันโอกาสงาน และถามคำถามได้ทุกเรื่อง
                  ร่วมกับสมาชิกคนหางานและนายจ้างนับพันคน
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:shrink-0 sm:flex-row">
              <a
                href={FACEBOOK_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#1877F2] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1461cf]"
              >
                <Facebook className="h-4 w-4" />
                เข้าร่วมชุมชน Facebook
              </a>
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" />}
                {copied ? 'คัดลอกลิงก์แล้ว' : 'แชร์งาน'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
