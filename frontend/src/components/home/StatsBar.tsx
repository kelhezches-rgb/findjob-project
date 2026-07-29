'use client'
import { useCountUp } from './useCountUp'
import { statsBar } from './mockData'

function StatItem({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  const { ref, value: animated } = useCountUp(value)
  const display = suffix
    ? animated.toFixed(1)
    : Math.round(animated).toLocaleString('th-TH')

  return (
    <div>
      <p ref={ref as React.RefObject<HTMLParagraphElement>} className="tabular-nums text-2xl font-bold text-[#4F46E5]">
        {display}
        {suffix && <span className="text-base">{suffix}</span>}
      </p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  )
}

export function StatsBar() {
  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
          {statsBar.map((s) => (
            <StatItem key={s.label} label={s.label} value={s.value} suffix={s.suffix} />
          ))}
        </div>
      </div>
    </section>
  )
}
