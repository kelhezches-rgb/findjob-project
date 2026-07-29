import Link from 'next/link'
import { MapPin, Users, BadgeCheck } from 'lucide-react'
import { Company } from '@/types'
import { CompanyLogo } from './CompanyLogo'

export function CompanyCard({ company }: { company: Company }) {
  return (
    <Link
      href={`/companies/${company.id}`}
      className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-indigo-300 hover:bg-indigo-50/30"
    >
      <CompanyLogo name={company.name} logoUrl={company.logoUrl} size="lg" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate font-semibold text-gray-900">{company.name}</h3>
          {company.isVerified && <BadgeCheck className="h-4 w-4 shrink-0 text-indigo-500" />}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
          {company.industry && <span>{company.industry}</span>}
          {company.size && (
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{company.size} คน</span>
          )}
          {company.province && (
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{company.province}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
