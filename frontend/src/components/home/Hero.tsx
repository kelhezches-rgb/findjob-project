'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin } from 'lucide-react'
import { Button } from '@/components/ui'
import { useCountUp } from './useCountUp'
import { heroStats, quickSearchTags } from './mockData'

export function Hero() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [province, setProvince] = useState('')
  const { ref: liveCountRef, value: liveCountValue } = useCountUp(heroStats.liveCount)

  // Query param names (q, province) match the real /jobs page's filter
  // shape, so this search bar hands off correctly to that page.
  const handleSearch = (overrideQ?: string) => {
    const params = new URLSearchParams()
    const query = overrideQ ?? q
    if (query)    params.set('q', query)
    if (province) params.set('province', province)
    router.push(`/jobs?${params.toString()}`)
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0F0F23] via-[#1e1b4b] to-[#2e1065] pt-16">
      {/* Radial glow accents */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 70% 50%, rgba(124,58,237,.35) 0%, transparent 70%), ' +
            'radial-gradient(ellipse 40% 60% at 20% 80%, rgba(79,70,229,.25) 0%, transparent 60%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          {/* Live badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" />
            </span>
            <span ref={liveCountRef as React.RefObject<HTMLSpanElement>} className="tabular-nums">
              {Math.round(liveCountValue).toLocaleString('th-TH')}
            </span>
            ตำแหน่งงานเปิดรับสมัครอยู่ตอนนี้
          </div>

          {/* Headline */}
          <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            งานที่ใช่
            <br />
            <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
              อยู่ที่นี่
            </span>
          </h1>
          <p className="mb-10 text-base leading-relaxed text-white/60 sm:text-lg">
            ค้นหาจากงานกว่า 12,000 ตำแหน่ง บริษัทชั้นนำกว่า 3,000 แห่ง
            <br className="hidden sm:block" />
            พร้อมเงินเดือนโปร่งใสและรีวิวจากพนักงานจริง
          </p>

          {/* Search bar */}
          <div className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-indigo-900/30 sm:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5">
              <Search className="h-5 w-5 shrink-0 text-gray-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="ตำแหน่งงาน บริษัท หรือคำสำคัญ"
                className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder-gray-400"
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 sm:w-44">
              <MapPin className="h-5 w-5 shrink-0 text-gray-400" />
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="จังหวัด"
                className="w-0 min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder-gray-400"
              />
            </div>

            <Button onClick={() => handleSearch()} className="shrink-0 !rounded-xl !py-3">
              <Search className="h-4 w-4" />
              ค้นหางาน
            </Button>
          </div>

          {/* Quick search tags */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <span className="self-center text-xs text-white/50">ค้นหายอดนิยม:</span>
            {quickSearchTags.map((tag) => (
              <button
                key={tag}
                onClick={() => { setQ(tag); handleSearch(tag) }}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/80 transition-colors hover:bg-white/20"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Wave divider into the next section */}
      <div className="relative h-16 overflow-hidden">
        <svg viewBox="0 0 1440 64" className="absolute bottom-0 w-full" preserveAspectRatio="none" aria-hidden="true">
          <path
            fill="#F9FAFB"
            d="M0,64L60,53.3C120,43,240,21,360,21.3C480,21,600,43,720,48C840,53,960,43,1080,37.3C1200,32,1320,32,1380,32L1440,32L1440,64L1380,64C1320,64,1200,64,1080,64C960,64,840,64,720,64C600,64,480,64,360,64C240,64,120,64,60,64Z"
          />
        </svg>
      </div>
    </section>
  )
}
