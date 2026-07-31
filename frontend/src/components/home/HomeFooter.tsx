import Link from 'next/link'
import { Facebook, Users, Youtube, Linkedin, Instagram } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'

const FOOTER_COLUMNS = [
  {
    title: 'สำหรับผู้หางาน',
    links: ['ค้นหางาน', 'สร้าง Resume', 'เงินเดือน', 'บทความ'],
  },
  {
    title: 'สำหรับนายจ้าง',
    links: ['ลงประกาศงาน', 'ค้นหา Resume', 'แผนราคา', 'โซลูชันองค์กร'],
  },
  {
    title: 'บริษัท',
    links: ['เกี่ยวกับเรา', 'ติดต่อเรา', 'ร่วมงานกับเรา', 'ข่าวสาร'],
  },
]

const LEGAL_LINKS = ['นโยบายความเป็นส่วนตัว', 'เงื่อนไขการใช้งาน', 'Cookies']

const SOCIAL_LINKS = [
  { label: 'Facebook Page',      href: 'https://facebook.com/jobboard.thailand',      Icon: Facebook,  hoverBg: 'hover:bg-[#1877F2]' },
  { label: 'Facebook Community', href: 'https://facebook.com/groups/jobboard.community', Icon: Users,  hoverBg: 'hover:bg-[#1877F2]' },
  { label: 'YouTube',            href: 'https://youtube.com/@jobboard.thailand',      Icon: Youtube,   hoverBg: 'hover:bg-[#FF0000]' },
  { label: 'LinkedIn',           href: 'https://linkedin.com/company/jobboard-thailand', Icon: Linkedin, hoverBg: 'hover:bg-[#0A66C2]' },
  { label: 'Instagram',          href: 'https://instagram.com/jobboard.thailand',     Icon: Instagram, hoverBg: 'hover:bg-[#E1306C]' },
]

export function HomeFooter() {
  return (
    <footer className="bg-[#0F0F23] py-12 text-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Logo variant="icon" href="/" className="mb-3 gap-2">
              <span className="text-lg font-bold text-white">JobBoard</span>
            </Logo>
            <p className="text-xs leading-relaxed">แพลตฟอร์มหางานและสรรหาบุคลากรชั้นนำของไทย</p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white">{col.title}</p>
              <ul className="space-y-2 text-xs">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="transition-colors hover:text-white">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white">ติดตาม</p>
            <div className="flex flex-wrap gap-3">
              {SOCIAL_LINKS.map(({ label, href, Icon, hoverBg }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 transition-colors ${hoverBg} hover:text-white`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row">
          <p>© 2025 JobBoard Thailand. All rights reserved.</p>
          <div className="flex gap-5">
            {LEGAL_LINKS.map((link) => (
              <Link key={link} href="#" className="transition-colors hover:text-white">{link}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
