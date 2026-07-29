import { HomeNavbar } from '@/components/home/HomeNavbar'
import { Hero } from '@/components/home/Hero'
import { StatsBar } from '@/components/home/StatsBar'
import { Categories } from '@/components/home/Categories'
import { FeaturedJobs } from '@/components/home/FeaturedJobs'
import { LatestJobs } from '@/components/home/LatestJobs'
import { CommunitySection } from '@/components/home/CommunitySection'
import { CTABanner } from '@/components/home/CTABanner'
import { HomeFooter } from '@/components/home/HomeFooter'

// Public marketing homepage. All content below is mock data — no API
// calls — per the Home-page redesign requirements. Auth-aware behavior
// (login/register vs. "go to dashboard") is preserved via HomeNavbar,
// which consumes the existing useAuth() hook without modifying it.
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50" id="main-content">
      <HomeNavbar />
      <Hero />
      <StatsBar />
      <Categories />
      <FeaturedJobs />
      <LatestJobs />
      <CommunitySection />
      <CTABanner />
      <HomeFooter />
    </div>
  )
}
