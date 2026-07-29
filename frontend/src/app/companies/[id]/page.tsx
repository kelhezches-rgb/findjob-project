'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Users, Globe, BadgeCheck, Briefcase } from 'lucide-react'
import { api, API_ORIGIN } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useSavedJobs } from '@/hooks'
import { SeekerNavbar } from '@/components/layout'
import { LoadingSpinner, EmptyState } from '@/components/ui'
import { CompanyLogo } from '@/components/company/CompanyLogo'
import { JobCard } from '@/components/jobs/JobCard'
import { Company, Job } from '@/types'

interface CompanyDetail extends Company {
  _count: { jobs: number }
}

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { savedIds, toggle } = useSavedJobs()
  const isSeeker = user?.role === 'seeker'

  const [company, setCompany] = useState<CompanyDetail | null>(null)
  const [jobs, setJobs]       = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    api.get<{ company: CompanyDetail; jobs: Job[] }>(`/companies/${params.id}`)
      .then(r => { setCompany(r.data.company); setJobs(r.data.jobs) })
      .catch(() => setError('ไม่พบบริษัทนี้'))
      .finally(() => setLoading(false))
  }, [params.id])

  return (
    <div className="min-h-screen bg-gray-50">
      <SeekerNavbar />

      <main id="main-content" className="mx-auto max-w-3xl px-4 py-8">
        <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> กลับ
        </button>

        {loading && <LoadingSpinner />}
        {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {company && (
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="h-32 w-full bg-gradient-to-r from-indigo-100 to-indigo-50 sm:h-44">
                {company.coverImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${API_ORIGIN}${company.coverImageUrl}`}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:gap-4">
                <CompanyLogo
                  name={company.name}
                  logoUrl={company.logoUrl}
                  size="lg"
                  className="-mt-8 h-20 w-20 rounded-2xl text-3xl ring-4 ring-white sm:-mt-10 sm:h-24 sm:w-24"
                />
                <div className="min-w-0 flex-1 pt-2 sm:pt-0">
                  <div className="flex items-center gap-1.5">
                    <h1 className="truncate text-xl font-bold text-gray-900">{company.name}</h1>
                    {company.isVerified && <BadgeCheck className="h-5 w-5 shrink-0 text-indigo-500" />}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                    {company.industry && <span>{company.industry}</span>}
                    {company.size && <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{company.size} คน</span>}
                    {company.province && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{company.province}</span>}
                    {company.website && (
                      <a href={company.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-indigo-600 hover:underline">
                        <Globe className="h-3.5 w-3.5" />เว็บไซต์
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {company.description && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="mb-3 text-base font-semibold text-gray-900">เกี่ยวกับบริษัท</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{company.description}</p>
              </div>
            )}

            {company.address && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="mb-2 text-base font-semibold text-gray-900">ที่อยู่</h2>
                <p className="text-sm text-gray-700">{company.address}</p>
              </div>
            )}

            <div>
              <h2 className="mb-3 flex items-center gap-1.5 text-base font-semibold text-gray-900">
                <Briefcase className="h-4 w-4" /> ตำแหน่งงานที่เปิดรับ ({company._count.jobs})
              </h2>

              {jobs.length === 0 ? (
                <EmptyState icon={<Briefcase className="h-12 w-12" />} title="ยังไม่มีตำแหน่งงานที่เปิดรับในขณะนี้" />
              ) : (
                <div className="flex flex-col gap-3">
                  {jobs.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSaved={isSeeker ? savedIds.has(job.id) : undefined}
                      onToggleSave={isSeeker ? toggle : undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
