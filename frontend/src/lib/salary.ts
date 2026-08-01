import { Job } from '@/types'

export const COMPANY_STRUCTURE_LABEL = 'ตามโครงสร้างบริษัท'

/**
 * Formats a job's salary for display.
 * - COMPANY_STRUCTURE -> "ตามโครงสร้างบริษัท" (never a hard-coded DB value —
 *   this is purely a display-time label for salaryType === 'COMPANY_STRUCTURE').
 * - RANGE (or older jobs with no salaryType at all, for backward
 *   compatibility) -> the existing numeric range formatting.
 * Returns `fallback` ('ไม่ระบุ' by default) when there's nothing to show.
 */
export function formatSalary(job: Pick<Job, 'salaryType' | 'salaryMin' | 'salaryMax'>, fallback: string | null = 'ไม่ระบุ'): string | null {
  if (job.salaryType === 'COMPANY_STRUCTURE') return COMPANY_STRUCTURE_LABEL

  if (!job.salaryMin && !job.salaryMax) return fallback
  const fmt = (n: number) => Number(n).toLocaleString('th-TH')
  if (job.salaryMin && job.salaryMax) return `฿${fmt(Number(job.salaryMin))} – ฿${fmt(Number(job.salaryMax))}`
  return `฿${fmt(Number(job.salaryMin ?? job.salaryMax))}+`
}
