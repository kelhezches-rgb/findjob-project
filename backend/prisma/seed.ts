import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Categories — organized into logical groups (see CLAUDE.md §5/§6).
  // Existing slugs (it-software, design-ux, marketing, finance, hr-training,
  // engineering, sales, healthcare, logistics, education, hospitality, remote)
  // are preserved exactly so existing Job.categoryId references keep working.
  const categories: { group: string; slug: string; name: string; icon: string }[] = [
    { group: "เทคโนโลยีและซอฟต์แวร์", slug: "it-software", name: "IT & Software", icon: "💻" },
    { group: "เทคโนโลยีและซอฟต์แวร์", slug: "software-dev", name: "พัฒนาซอฟต์แวร์", icon: "🧑‍💻" },
    { group: "เทคโนโลยีและซอฟต์แวร์", slug: "frontend-dev", name: "Frontend Developer", icon: "🖥️" },
    { group: "เทคโนโลยีและซอฟต์แวร์", slug: "backend-dev", name: "Backend Developer", icon: "🗄️" },
    { group: "เทคโนโลยีและซอฟต์แวร์", slug: "mobile-dev", name: "Mobile Developer", icon: "📱" },
    { group: "เทคโนโลยีและซอฟต์แวร์", slug: "devops", name: "DevOps / SRE", icon: "🔧" },
    { group: "เทคโนโลยีและซอฟต์แวร์", slug: "qa-testing", name: "QA & Software Testing", icon: "🧪" },
    { group: "เทคโนโลยีและซอฟต์แวร์", slug: "data-science", name: "Data Science", icon: "📊" },
    { group: "เทคโนโลยีและซอฟต์แวร์", slug: "data-engineering", name: "Data Engineering", icon: "🗃️" },
    { group: "เทคโนโลยีและซอฟต์แวร์", slug: "ai-ml", name: "AI / Machine Learning", icon: "🤖" },
    { group: "เทคโนโลยีและซอฟต์แวร์", slug: "cybersecurity", name: "Cybersecurity", icon: "🛡️" },
    { group: "ออกแบบและครีเอทีฟ", slug: "design-ux", name: "Design & UX", icon: "🎨" },
    { group: "ออกแบบและครีเอทีฟ", slug: "graphic-design", name: "Graphic Design", icon: "🖌️" },
    { group: "ออกแบบและครีเอทีฟ", slug: "ui-design", name: "UI Design", icon: "🧩" },
    { group: "ออกแบบและครีเอทีฟ", slug: "motion-graphics", name: "Motion Graphics", icon: "🎞️" },
    { group: "ออกแบบและครีเอทีฟ", slug: "industrial-design", name: "Industrial Design", icon: "🛠️" },
    { group: "ออกแบบและครีเอทีฟ", slug: "photography", name: "ถ่ายภาพ", icon: "📷" },
    { group: "ออกแบบและครีเอทีฟ", slug: "content-creation", name: "Content Creator", icon: "📸" },
    { group: "การตลาดและสื่อ", slug: "marketing", name: "Marketing", icon: "📣" },
    { group: "การตลาดและสื่อ", slug: "digital-marketing", name: "Digital Marketing", icon: "📲" },
    { group: "การตลาดและสื่อ", slug: "social-media", name: "Social Media Management", icon: "💬" },
    { group: "การตลาดและสื่อ", slug: "seo-sem", name: "SEO / SEM", icon: "🔍" },
    { group: "การตลาดและสื่อ", slug: "brand-management", name: "Brand Management", icon: "🏷️" },
    { group: "การตลาดและสื่อ", slug: "pr-communications", name: "PR & Communications", icon: "📰" },
    { group: "การตลาดและสื่อ", slug: "copywriting", name: "Copywriting", icon: "✍️" },
    { group: "งานขายและพัฒนาธุรกิจ", slug: "sales", name: "Sales", icon: "📈" },
    { group: "งานขายและพัฒนาธุรกิจ", slug: "business-development", name: "Business Development", icon: "🤝" },
    { group: "งานขายและพัฒนาธุรกิจ", slug: "account-management", name: "Account Management", icon: "📇" },
    { group: "งานขายและพัฒนาธุรกิจ", slug: "retail-sales", name: "พนักงานขายหน้าร้าน", icon: "🛍️" },
    { group: "งานขายและพัฒนาธุรกิจ", slug: "telesales", name: "Telesales", icon: "☎️" },
    { group: "งานขายและพัฒนาธุรกิจ", slug: "real-estate-sales", name: "ขายอสังหาริมทรัพย์", icon: "🏘️" },
    { group: "บัญชีและการเงิน", slug: "finance", name: "Finance & Accounting", icon: "💰" },
    { group: "บัญชีและการเงิน", slug: "accounting", name: "บัญชี", icon: "🧾" },
    { group: "บัญชีและการเงิน", slug: "auditing", name: "ตรวจสอบบัญชี", icon: "🔎" },
    { group: "บัญชีและการเงิน", slug: "tax", name: "ภาษีอากร", icon: "🧮" },
    { group: "บัญชีและการเงิน", slug: "banking", name: "ธนาคาร", icon: "🏦" },
    { group: "บัญชีและการเงิน", slug: "investment", name: "การลงทุน", icon: "📉" },
    { group: "บัญชีและการเงิน", slug: "financial-planning", name: "วางแผนการเงิน", icon: "🗂️" },
    { group: "ทรัพยากรบุคคลและธุรการ", slug: "hr-training", name: "HR & Training", icon: "🤝" },
    { group: "ทรัพยากรบุคคลและธุรการ", slug: "recruitment", name: "สรรหาบุคลากร", icon: "🧑‍💼" },
    { group: "ทรัพยากรบุคคลและธุรการ", slug: "compensation-benefits", name: "ค่าตอบแทนและสวัสดิการ", icon: "💳" },
    { group: "ทรัพยากรบุคคลและธุรการ", slug: "admin-office", name: "งานธุรการ", icon: "🗄️" },
    { group: "ทรัพยากรบุคคลและธุรการ", slug: "executive-assistant", name: "เลขานุการผู้บริหาร", icon: "📋" },
    { group: "ทรัพยากรบุคคลและธุรการ", slug: "payroll", name: "เงินเดือน (Payroll)", icon: "🧮" },
    { group: "วิศวกรรม", slug: "engineering", name: "Engineering", icon: "⚙️" },
    { group: "วิศวกรรม", slug: "civil-engineering", name: "วิศวกรรมโยธา", icon: "🏗️" },
    { group: "วิศวกรรม", slug: "mechanical-engineering", name: "วิศวกรรมเครื่องกล", icon: "⚙️" },
    { group: "วิศวกรรม", slug: "electrical-engineering", name: "วิศวกรรมไฟฟ้า", icon: "🔌" },
    { group: "วิศวกรรม", slug: "industrial-engineering", name: "วิศวกรรมอุตสาหการ", icon: "🏭" },
    { group: "วิศวกรรม", slug: "chemical-engineering", name: "วิศวกรรมเคมี", icon: "🧪" },
    { group: "วิศวกรรม", slug: "environmental-engineering", name: "วิศวกรรมสิ่งแวดล้อม", icon: "🌱" },
    { group: "วิศวกรรม", slug: "automotive-engineering", name: "วิศวกรรมยานยนต์", icon: "🚗" },
    { group: "การผลิตและอุตสาหกรรม", slug: "production-planning", name: "วางแผนการผลิต", icon: "🗓️" },
    { group: "การผลิตและอุตสาหกรรม", slug: "quality-control", name: "ควบคุมคุณภาพ (QC/QA)", icon: "✅" },
    { group: "การผลิตและอุตสาหกรรม", slug: "manufacturing-operations", name: "งานปฏิบัติการโรงงาน", icon: "🏭" },
    { group: "การผลิตและอุตสาหกรรม", slug: "maintenance-technician", name: "ช่างซ่อมบำรุง", icon: "🔩" },
    { group: "การผลิตและอุตสาหกรรม", slug: "warehouse-operations", name: "งานคลังสินค้า", icon: "📦" },
    { group: "การผลิตและอุตสาหกรรม", slug: "process-improvement", name: "ปรับปรุงกระบวนการผลิต", icon: "📈" },
    { group: "โลจิสติกส์และซัพพลายเชน", slug: "logistics", name: "Logistics", icon: "🚚" },
    { group: "โลจิสติกส์และซัพพลายเชน", slug: "supply-chain", name: "Supply Chain", icon: "🔗" },
    { group: "โลจิสติกส์และซัพพลายเชน", slug: "procurement", name: "จัดซื้อ", icon: "🛒" },
    { group: "โลจิสติกส์และซัพพลายเชน", slug: "shipping-freight", name: "งานขนส่ง / Freight", icon: "🚢" },
    { group: "โลจิสติกส์และซัพพลายเชน", slug: "import-export", name: "นำเข้า-ส่งออก", icon: "🌐" },
    { group: "สาธารณสุขและการแพทย์", slug: "healthcare", name: "Healthcare", icon: "🏥" },
    { group: "สาธารณสุขและการแพทย์", slug: "nursing", name: "พยาบาล", icon: "👩‍⚕️" },
    { group: "สาธารณสุขและการแพทย์", slug: "pharmacy", name: "เภสัชกรรม", icon: "💊" },
    { group: "สาธารณสุขและการแพทย์", slug: "physician", name: "แพทย์", icon: "🩺" },
    { group: "สาธารณสุขและการแพทย์", slug: "dentistry", name: "ทันตกรรม", icon: "🦷" },
    { group: "สาธารณสุขและการแพทย์", slug: "physical-therapy", name: "กายภาพบำบัด", icon: "🧑‍⚕️" },
    { group: "สาธารณสุขและการแพทย์", slug: "public-health", name: "สาธารณสุข", icon: "🏙️" },
    { group: "การศึกษาและฝึกอบรม", slug: "education", name: "Education", icon: "📚" },
    { group: "การศึกษาและฝึกอบรม", slug: "teaching", name: "งานสอน / ครู", icon: "🍎" },
    { group: "การศึกษาและฝึกอบรม", slug: "tutoring", name: "ติวเตอร์", icon: "📖" },
    { group: "การศึกษาและฝึกอบรม", slug: "academic-administration", name: "งานธุรการการศึกษา", icon: "🏫" },
    { group: "การศึกษาและฝึกอบรม", slug: "corporate-training", name: "ฝึกอบรมองค์กร", icon: "🎓" },
    { group: "โรงแรมและการท่องเที่ยว", slug: "hospitality", name: "Hospitality", icon: "🏨" },
    { group: "โรงแรมและการท่องเที่ยว", slug: "hotel-management", name: "บริหารโรงแรม", icon: "🛎️" },
    { group: "โรงแรมและการท่องเที่ยว", slug: "restaurant-fb", name: "ร้านอาหาร & F&B", icon: "🍽️" },
    { group: "โรงแรมและการท่องเที่ยว", slug: "tour-guide", name: "มัคคุเทศก์", icon: "🗺️" },
    { group: "โรงแรมและการท่องเที่ยว", slug: "event-planning", name: "จัดงานอีเวนต์", icon: "🎪" },
    { group: "กฎหมาย", slug: "legal-counsel", name: "ที่ปรึกษากฎหมาย", icon: "⚖️" },
    { group: "กฎหมาย", slug: "paralegal", name: "ผู้ช่วยทนายความ", icon: "📜" },
    { group: "กฎหมาย", slug: "compliance", name: "Compliance", icon: "🧷" },
    { group: "กฎหมาย", slug: "contract-management", name: "บริหารสัญญา", icon: "📄" },
    { group: "บริการลูกค้า", slug: "customer-support", name: "Customer Support", icon: "🎧" },
    { group: "บริการลูกค้า", slug: "call-center", name: "Call Center", icon: "📞" },
    { group: "บริการลูกค้า", slug: "technical-support", name: "Technical Support", icon: "🖥️" },
    { group: "ก่อสร้างและอสังหาริมทรัพย์", slug: "construction-management", name: "บริหารงานก่อสร้าง", icon: "🏗️" },
    { group: "ก่อสร้างและอสังหาริมทรัพย์", slug: "architecture", name: "สถาปัตยกรรม", icon: "📐" },
    { group: "ก่อสร้างและอสังหาริมทรัพย์", slug: "real-estate-management", name: "บริหารอสังหาริมทรัพย์", icon: "🏢" },
    { group: "ก่อสร้างและอสังหาริมทรัพย์", slug: "property-management", name: "จัดการทรัพย์สิน", icon: "🔑" },
    { group: "เกษตรกรรมและสิ่งแวดล้อม", slug: "agriculture", name: "เกษตรกรรม", icon: "🌾" },
    { group: "เกษตรกรรมและสิ่งแวดล้อม", slug: "agribusiness", name: "ธุรกิจการเกษตร", icon: "🚜" },
    { group: "เกษตรกรรมและสิ่งแวดล้อม", slug: "fisheries", name: "ประมง", icon: "🐟" },
    { group: "เกษตรกรรมและสิ่งแวดล้อม", slug: "environmental-science", name: "วิทยาศาสตร์สิ่งแวดล้อม", icon: "🌍" },
    { group: "ค้าปลีกและงานบริการทั่วไป", slug: "retail-management", name: "บริหารร้านค้าปลีก", icon: "🏬" },
    { group: "ค้าปลีกและงานบริการทั่วไป", slug: "merchandising", name: "Merchandising", icon: "🗂️" },
    { group: "ค้าปลีกและงานบริการทั่วไป", slug: "beauty-wellness-services", name: "ความงามและสุขภาพ", icon: "💆" },
    { group: "ค้าปลีกและงานบริการทั่วไป", slug: "security-services", name: "รักษาความปลอดภัย", icon: "🛡️" },
    { group: "ค้าปลีกและงานบริการทั่วไป", slug: "driver-delivery", name: "คนขับรถ / จัดส่ง", icon: "🚗" },
    { group: "ภาครัฐและองค์กรไม่แสวงหากำไร", slug: "government", name: "ราชการ", icon: "🏛️" },
    { group: "ภาครัฐและองค์กรไม่แสวงหากำไร", slug: "ngo-nonprofit", name: "NGO / องค์กรไม่แสวงหากำไร", icon: "🤲" },
    { group: "ภาครัฐและองค์กรไม่แสวงหากำไร", slug: "social-work", name: "งานสังคมสงเคราะห์", icon: "🧑‍🤝‍🧑" },
    { group: "ศิลปะและบันเทิง", slug: "performing-arts", name: "ศิลปะการแสดง", icon: "🎭" },
    { group: "ศิลปะและบันเทิง", slug: "music", name: "ดนตรี", icon: "🎵" },
    { group: "ศิลปะและบันเทิง", slug: "film-tv-production", name: "งานผลิตภาพยนตร์ & TV", icon: "🎬" },
    { group: "ศิลปะและบันเทิง", slug: "journalism", name: "งานข่าว / สื่อสารมวลชน", icon: "🗞️" },
    { group: "ทำงานทางไกล / ฟรีแลนซ์", slug: "remote", name: "Remote / WFH", icon: "🌐" },
    { group: "ทำงานทางไกล / ฟรีแลนซ์", slug: "freelance-general", name: "งานฟรีแลนซ์ทั่วไป", icon: "🧳" },
    { group: "ทำงานทางไกล / ฟรีแลนซ์", slug: "part-time-remote", name: "พาร์ทไทม์ทางไกล", icon: "⏱️" },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, group: cat.group },
      create: cat,
    })
  }
  console.log(`✅ ${categories.length} categories seeded across ${new Set(categories.map(c => c.group)).size} groups`)

  // Admin user
  const adminHash = await bcrypt.hash('Admin@1234', 12)
  await prisma.user.upsert({
    where: { email: 'admin@jobboard.com' },
    update: {},
    create: {
      email: 'admin@jobboard.com',
      passwordHash: adminHash,
      role: 'admin',
      isVerified: true,
      isActive: true,
    },
  })
  console.log('✅ Admin user seeded — admin@jobboard.com / Admin@1234')

  // Demo employer
  const empHash = await bcrypt.hash('Demo@1234', 12)
  const empUser = await prisma.user.upsert({
    where: { email: 'employer@demo.com' },
    update: {},
    create: {
      email: 'employer@demo.com',
      passwordHash: empHash,
      role: 'employer',
      isVerified: true,
    },
  })
  const company = await prisma.company.upsert({
    where: { id: 'demo-company-id' },
    update: {},
    create: {
      id: 'demo-company-id',
      name: 'Demo Tech Co., Ltd.',
      industry: 'IT & Software',
      size: '51-200',
      province: 'กรุงเทพมหานคร',
      description: 'บริษัทพัฒนาซอฟต์แวร์ชั้นนำ',
      isVerified: true,
    },
  })
  await prisma.employer.upsert({
    where: { userId: empUser.id },
    update: {},
    create: { userId: empUser.id, companyId: company.id, position: 'HR Manager' },
  })
  console.log('✅ Demo employer seeded — employer@demo.com / Demo@1234')

  // Demo seeker
  const seekHash = await bcrypt.hash('Demo@1234', 12)
  const seekUser = await prisma.user.upsert({
    where: { email: 'seeker@demo.com' },
    update: {},
    create: {
      email: 'seeker@demo.com',
      passwordHash: seekHash,
      role: 'seeker',
      isVerified: true,
    },
  })
  await prisma.jobSeeker.upsert({
    where: { userId: seekUser.id },
    update: {},
    create: {
      userId: seekUser.id,
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      headline: 'Full-stack Developer 3 ปี',
    },
  })
  console.log('✅ Demo seeker seeded — seeker@demo.com / Demo@1234')
}

main().catch(console.error).finally(() => prisma.$disconnect())
