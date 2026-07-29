'use client'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { useRevealOnScroll } from './useRevealOnScroll'
import { ctaStats } from './mockData'

export function CTABanner() {
  const { ref, isVisible } = useRevealOnScroll()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0F0F23] via-[#1e1b4b] to-[#2e1065] py-16">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 70% 50%, rgba(124,58,237,.35) 0%, transparent 70%), ' +
            'radial-gradient(ellipse 40% 60% at 20% 80%, rgba(79,70,229,.25) 0%, transparent 60%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`grid items-center gap-10 transition-all duration-500 md:grid-cols-2 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-300">สำหรับนายจ้าง</p>
            <h2 className="mb-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              หาคนที่ใช่
              <br />
              เร็วกว่าเดิม
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-white/60">
              เข้าถึงผู้สมัครคุณภาพกว่า 98,000 คน ด้วยเครื่องมือกรองอัจฉริยะ
              <br />
              ลงประกาศงานวันนี้ ฟรีตลอด 30 วันแรก
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/register">
                <Button className="w-full sm:w-auto">ลงประกาศงานฟรี</Button>
              </Link>
              <Link href="#" className="rounded-xl border border-white/30 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10">
                ดูแผนราคา
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {ctaStats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-3xl font-extrabold text-white">{s.value}</p>
                <p className="mt-1 text-xs text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
