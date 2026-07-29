// Mock data for the public Home page only.
// No backend/API calls — matches the "mock data first" requirement for this page.

export interface MockJob {
  id: string
  title: string
  company: string
  companyInitial: string
  companyColor: string   // Tailwind bg/text pair for the logo avatar
  location: string
  jobType: 'full_time' | 'part_time' | 'contract' | 'internship' | 'remote'
  salaryLabel: string
  postedLabel: string
  isNew?: boolean
}

export interface MockFeaturedJob extends MockJob {
  tags: string[]
  description: string
}

export interface MockCategory {
  slug: string
  name: string
  icon: string
  count: string
}

export const heroStats = {
  liveCount: 12847,
}

export const statsBar = [
  { label: 'ตำแหน่งงานทั้งหมด', value: 12847 },
  { label: 'บริษัทที่เข้าร่วม', value: 3210 },
  { label: 'ผู้สมัครงาน', value: 98400 },
  { label: 'คะแนนความพึงพอใจ', value: 4.8, suffix: '/5' },
]

export const ctaStats = [
  { label: 'เวลาเฉลี่ยในการได้ผู้สมัครคนแรก', value: '48h' },
  { label: 'ผู้สมัครพร้อม Resume', value: '98K+' },
  { label: 'บริษัทที่ไว้วางใจเรา', value: '3K+' },
  { label: 'คะแนนจากนายจ้าง', value: '4.8★' },
]

export const quickSearchTags = [
  'Frontend Developer',
  'Data Analyst',
  'UX Designer',
  'Product Manager',
  'ทำงานทางไกล',
]

// One representative tile per category group (see backend prisma/seed.ts for
// the full 100+ category taxonomy). Kept as mock/display data only — the
// real filtering still goes through the live /jobs/categories endpoint.
export const categories: MockCategory[] = [
  { slug: 'it',            name: 'IT & Software',            icon: '💻', count: '4,201 งาน' },
  { slug: 'design',        name: 'ออกแบบและครีเอทีฟ',        icon: '🎨', count: '1,088 งาน' },
  { slug: 'marketing',     name: 'การตลาดและสื่อ',           icon: '📣', count: '987 งาน' },
  { slug: 'sales',         name: 'งานขายและพัฒนาธุรกิจ',     icon: '📈', count: '1,455 งาน' },
  { slug: 'finance',       name: 'บัญชีและการเงิน',          icon: '💰', count: '1,340 งาน' },
  { slug: 'hr',            name: 'ทรัพยากรบุคคลและธุรการ',   icon: '🤝', count: '623 งาน' },
  { slug: 'eng',           name: 'วิศวกรรม',                 icon: '⚙️', count: '2,130 งาน' },
  { slug: 'manufacturing', name: 'การผลิตและอุตสาหกรรม',     icon: '🏭', count: '967 งาน' },
  { slug: 'logistics',     name: 'โลจิสติกส์และซัพพลายเชน',  icon: '🚚', count: '445 งาน' },
  { slug: 'health',        name: 'สาธารณสุขและการแพทย์',     icon: '🏥', count: '789 งาน' },
  { slug: 'edu',           name: 'การศึกษาและฝึกอบรม',       icon: '📚', count: '312 งาน' },
  { slug: 'hospitality',   name: 'โรงแรมและการท่องเที่ยว',   icon: '🏨', count: '598 งาน' },
  { slug: 'legal',         name: 'กฎหมาย',                   icon: '⚖️', count: '156 งาน' },
  { slug: 'customer',      name: 'บริการลูกค้า',             icon: '🎧', count: '734 งาน' },
  { slug: 'construction',  name: 'ก่อสร้างและอสังหาริมทรัพย์', icon: '🏗️', count: '512 งาน' },
  { slug: 'agriculture',   name: 'เกษตรกรรมและสิ่งแวดล้อม',  icon: '🌾', count: '198 งาน' },
  { slug: 'retail',        name: 'ค้าปลีกและงานบริการทั่วไป', icon: '🏬', count: '901 งาน' },
  { slug: 'government',    name: 'ภาครัฐและ NGO',            icon: '🏛️', count: '267 งาน' },
  { slug: 'arts',          name: 'ศิลปะและบันเทิง',          icon: '🎭', count: '184 งาน' },
  { slug: 'remote',        name: 'Remote / WFH',             icon: '🌐', count: '879 งาน' },
]

export const featuredJobs: MockFeaturedJob[] = [
  {
    id: 'f1',
    title: 'Senior Backend Engineer (Go)',
    company: 'SCB Tech X',
    companyInitial: 'S',
    companyColor: 'bg-indigo-50 text-indigo-600',
    location: 'กรุงเทพฯ',
    jobType: 'full_time',
    salaryLabel: '฿120,000 – ฿180,000',
    postedLabel: 'งานประจำ',
    description: 'รับผิดชอบออกแบบและพัฒนา Microservices ระดับ Enterprise ด้วย Go / Kubernetes สนับสนุนทีมกว่า 200 คน',
    tags: ['Go', 'Kubernetes', 'Microservices'],
  },
  {
    id: 'f2',
    title: 'Product Designer (UI/UX)',
    company: 'LINE Thailand',
    companyInitial: 'L',
    companyColor: 'bg-amber-50 text-amber-500',
    location: 'กรุงเทพฯ',
    jobType: 'full_time',
    salaryLabel: '฿80,000 – ฿130,000',
    postedLabel: 'Hybrid',
    description: 'ร่วมออกแบบประสบการณ์ผู้ใช้สำหรับแอปที่มีผู้ใช้งานกว่า 50 ล้านคนในเอเชีย ทำงานร่วมกับทีม Product Manager และ Engineer',
    tags: ['Figma', 'Prototyping', 'Design System'],
  },
  {
    id: 'f3',
    title: 'Data Scientist — Personalization',
    company: 'Grab Thailand',
    companyInitial: 'G',
    companyColor: 'bg-green-50 text-green-600',
    location: 'กรุงเทพฯ',
    jobType: 'full_time',
    salaryLabel: '฿100,000 – ฿160,000',
    postedLabel: 'งานประจำ',
    description: 'พัฒนาโมเดล ML สำหรับ Personalization ของ Feed และ Recommendation Engine รองรับผู้ใช้หลายล้านคนต่อวัน',
    tags: ['Python', 'PyTorch', 'Spark'],
  },
]

export const latestJobs: MockJob[] = [
  {
    id: 'l1',
    title: 'Frontend Developer (React)',
    company: 'Kasikorn Bank',
    companyInitial: 'K',
    companyColor: 'bg-blue-50 text-blue-600',
    location: 'กรุงเทพฯ',
    jobType: 'full_time',
    salaryLabel: '฿60,000+',
    postedLabel: '2 ชม. ที่แล้ว',
    isNew: true,
  },
  {
    id: 'l2',
    title: 'DevOps Engineer (AWS)',
    company: 'True Digital Group',
    companyInitial: 'T',
    companyColor: 'bg-purple-50 text-purple-600',
    location: 'ทำงานทางไกล',
    jobType: 'remote',
    salaryLabel: '฿90,000+',
    postedLabel: '5 ชม. ที่แล้ว',
  },
  {
    id: 'l3',
    title: 'Marketing Manager (Digital)',
    company: 'Central Retail',
    companyInitial: 'C',
    companyColor: 'bg-red-50 text-red-500',
    location: 'กรุงเทพฯ',
    jobType: 'full_time',
    salaryLabel: '฿70,000 – ฿100,000',
    postedLabel: '1 วันที่แล้ว',
  },
  {
    id: 'l4',
    title: 'Graphic Designer (Part-time)',
    company: 'ADAY Pocket',
    companyInitial: 'A',
    companyColor: 'bg-orange-50 text-orange-500',
    location: 'กรุงเทพฯ',
    jobType: 'part_time',
    salaryLabel: '฿300/ชม.',
    postedLabel: '1 วันที่แล้ว',
  },
  {
    id: 'l5',
    title: 'Software Engineering Intern',
    company: 'Muang Thai Life Assurance',
    companyInitial: 'M',
    companyColor: 'bg-teal-50 text-teal-600',
    location: 'กรุงเทพฯ',
    jobType: 'internship',
    salaryLabel: '฿15,000/เดือน',
    postedLabel: '2 วันที่แล้ว',
  },
  {
    id: 'l6',
    title: 'Product Manager (B2B SaaS)',
    company: 'ByteArk',
    companyInitial: 'B',
    companyColor: 'bg-indigo-50 text-indigo-600',
    location: 'ทำงานทางไกล',
    jobType: 'remote',
    salaryLabel: '฿95,000+',
    postedLabel: '3 วันที่แล้ว',
    isNew: true,
  },
]

export const JOB_TYPE_LABELS: Record<MockJob['jobType'], string> = {
  full_time:  'งานประจำ',
  part_time:  'พาร์ทไทม์',
  contract:   'สัญญาจ้าง',
  internship: 'ฝึกงาน',
  remote:     'Remote',
}

export const JOB_TYPE_FILTERS: { value: 'all' | MockJob['jobType']; label: string }[] = [
  { value: 'all',        label: 'ทั้งหมด' },
  { value: 'full_time',  label: 'งานประจำ' },
  { value: 'remote',     label: 'Remote' },
  { value: 'part_time',  label: 'พาร์ทไทม์' },
  { value: 'internship', label: 'ฝึกงาน' },
]
