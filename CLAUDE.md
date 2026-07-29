# CLAUDE.md — JobBoard Production System

อ่านไฟล์นี้ก่อนแก้โค้ดทุกครั้ง เป็นเอกสารอ้างอิงหลักสำหรับ AI agent ที่กลับมาทำงานต่อในโปรเจกต์นี้

---

## 1. ภาพรวมระบบ

Job Board platform สองฝั่งผู้ใช้ (seeker / employer) + Admin Panel

| Layer    | Stack                                          |
|----------|------------------------------------------------|
| Frontend | Next.js 15, TypeScript, TailwindCSS, Zustand   |
| Backend  | Node.js, Express, Prisma ORM, TypeScript       |
| Database | PostgreSQL 16                                  |
| Auth     | JWT (access 15m in-memory + refresh 7d httpOnly cookie) |
| Upload   | Multer → local disk `/uploads/` (PDF only, 5MB) |

---

## 2. สถาปัตยกรรม Backend

```
backend/src/
├── app.ts                          # Express entry — mount routers ที่นี่เท่านั้น
├── config/
│   ├── db.ts                       # Prisma singleton — import นี้แทน new PrismaClient()
│   └── multer.ts                   # PDF-only upload, limit 5MB
├── middlewares/
│   ├── auth.middleware.ts           # verifyAccessToken → req.user
│   ├── role.middleware.ts           # requireRole(...roles)
│   ├── validate.middleware.ts       # validate(zodSchema) body | validateQuery(zodSchema) query
│   └── error.middleware.ts          # global catch-all — mount LAST ใน app.ts
├── modules/<name>/
│   ├── <name>.service.ts            # business logic + Prisma — ห้ามมี req/res
│   ├── <name>.controller.ts         # รับ req/res, เรียก service, try/catch
│   └── <name>.routes.ts             # ผูก middleware + controller
├── types/index.ts                   # AuthPayload, AuthRequest
├── utils/
│   ├── jwt.ts                       # signAccessToken, signRefreshToken, verify*
│   └── pagination.ts                # paginate(page, limit) → {skip, take}
└── validators/index.ts              # zod schemas ทั้งหมด
```

**Pattern บังคับ:** `routes → controller → service → prisma`
- Service: ห้าม import `Request`/`Response`
- Controller: ห้ามเรียก Prisma ตรง
- Validator: ทุก input ผ่าน Zod — ห้าม validate มือใน controller

### Auth Flow

```
Client                    Backend
  │── POST /auth/login ──▶│
  │◀── {accessToken} ─────│ + Set-Cookie: refreshToken (httpOnly, 7d)
  │
  │── GET /api/* ─────────│ Authorization: Bearer <accessToken> (15m)
  │
  │── POST /auth/refresh ─│ (cookie sent automatically)
  │◀── {accessToken} ─────│ ← new access token
```

- `accessToken` เก็บใน **Zustand memory** เท่านั้น — ห้าม localStorage
- `refreshToken` เก็บใน **httpOnly cookie** scope path `/api/auth`
- Axios interceptor จับ 401 → `/auth/refresh` → retry อัตโนมัติ (ดู `frontend/src/lib/api.ts`)

### Ownership Pattern (สำคัญมาก — อ่านทุกครั้งก่อนเขียน service ใหม่)

```typescript
// ✅ ถูก: หา profile จาก userId (JWT) ก่อน แล้วเอา profile.id ไป filter
const seeker = await prisma.jobSeeker.findUnique({ where: { userId } })
// ✅ ถูก: verify ownership ก่อน query ทุกครั้ง
const resume = await prisma.resume.findFirst({ where: { id: resumeId, jobSeekerId: seeker.id } })
if (!resume) throw new Error('Resume not found')

// ❌ ผิด: trust req.body.jobSeekerId — user ปลอมได้
// ❌ ผิด: query โดยไม่เช็ค ownership
```

---

## 3. สถาปัตยกรรม Frontend

**⚠️ เปลี่ยนจาก Route Groups เป็นโฟลเดอร์จริงแล้ว (แก้ bug route collision)** — เดิมใช้ `(auth)` `(seeker)` `(employer)` `(admin)` แต่ route groups ไม่เพิ่ม URL segment ทำให้ `(admin)/jobs/page.tsx` กับ public `jobs/page.tsx` ชนกันที่ `/jobs` ตอนนี้ทุก role มีโฟลเดอร์ URL จริงของตัวเอง ชนกันไม่ได้อีกแล้วโดยโครงสร้าง

```
frontend/src/
├── app/
│   ├── auth/                         # Public — login, register, forgot/reset-password, verify-email
│   │   ├── login/page.tsx            → /auth/login
│   │   ├── register/page.tsx         → /auth/register
│   │   ├── forgot-password/page.tsx  → /auth/forgot-password
│   │   ├── reset-password/page.tsx   → /auth/reset-password
│   │   └── verify-email/page.tsx     → /auth/verify-email
│   ├── jobs/                         # Public (ดูได้แม้ไม่ login)
│   │   ├── page.tsx                  → /jobs
│   │   └── [id]/page.tsx             → /jobs/[id]
│   ├── seeker/
│   │   ├── layout.tsx                # Guard: redirect /auth/login ถ้า role ≠ seeker
│   │   ├── profile/, resumes/, cv-files/, applications/, saved-jobs/
│   ├── employer/
│   │   ├── layout.tsx                # Guard: redirect /auth/login ถ้า role ≠ employer
│   │   ├── dashboard/page.tsx        → /employer/dashboard (สถิติภาพรวม)
│   │   ├── company/page.tsx          → /employer/company
│   │   └── jobs/                     → /employer/jobs (job listing — ย้ายมาจาก dashboard เดิม)
│   │       ├── page.tsx, create/, [id]/edit/, [id]/applicants/
│   └── admin/
│       ├── layout.tsx                # Guard: redirect /auth/login ถ้า role ≠ admin
│       └── dashboard/, users/, jobs/, companies/
├── components/
│   ├── ui/index.tsx                  # Input, Textarea, Select, Button, Badge, Modal, EmptyState, LoadingSpinner, PaginationBar
│   ├── layout/index.tsx              # SeekerNavbar, EmployerNavbar, AdminNavbar (href ทั้งหมดต้อง prefix ตาม role)
│   ├── employer/JobPostForm.tsx
│   └── resume/ResumeForm.tsx
├── hooks/index.ts                    # useJobSearch, useResumes, useApplications, useSavedJobs, useEmployerJobs, useApplicants, useAdminStats
├── lib/api.ts                        # Axios instance เดียว — interceptor auto-refresh
├── store/authStore.ts                # Zustand: user + accessToken (memory only)
└── types/index.ts                    # TypeScript types ทั้งหมด — sync กับ Prisma schema ด้วยมือ
```

**หน้าที่ต้องการ seeker ใช้:** ต้อง `useSavedJobs()` เพื่อ init savedIds ก่อน render ปุ่ม bookmark

**Pattern หน้าที่ดึงข้อมูลตาม id:** ใช้ `'use client'` + `useParams()` + `useEffect` fetch ด้วย axios — ไม่ใช้ server component เพราะต้องการ JWT จาก Zustand (client only)

---

## 4. กฎการเขียนโค้ด

### Backend
1. **Password hash:** ใช้ `bcrypt.hash(password, 12)` เท่านั้น — ห้าม import bcrypt นอก auth.service.ts
2. **Error response format:** `{ message: string }` เสมอ — ไม่ส่ง stack trace ไปหา client
3. **Public vs Protected routes:** `/api/jobs/*` (GET) เป็น public — ห้ามใส่ `authenticate` บน GET job list/detail
4. **Prisma nested arrays (resume):** ใช้ pattern `deleteMany({}) + create([...])` เสมอ ไม่ diff ทีละ record
5. **Salary validation:** เช็คทั้งใน Zod schema และ service — อย่าเชื่อแค่อย่างเดียว
6. **Job visibility rule:** public จะเห็นเฉพาะ `status: 'active'` AND `(expiresAt IS NULL OR expiresAt > NOW())`

### Frontend
1. **UI components:** ใช้แค่ `components/ui/index.tsx` — ห้ามสร้าง `<input>` ดิบในหน้า feature
2. **Error messages:** ภาษาไทยเสมอ — code/comment เป็น English ได้
3. **Date input → ISO:** `new Date(\`${dateInput}T00:00:00Z\`).toISOString()` ก่อนส่ง API
4. **Static file URL:** CV PDF อยู่ที่ `http://localhost:5000/uploads/filename.pdf` ไม่ใช่ `/api/uploads`
5. **Hooks:** ทุก API call ต้องอยู่ใน hook (`hooks/index.ts`) — ห้าม call `api.get()` ตรงใน component

---

## 5. ฟีเจอร์ที่ implement แล้ว ✅

### Job Seeker
- [x] Register + Login (role toggle + password strength meter)
- [x] Profile (firstName, lastName, phone, headline, bio)
- [x] Resume Builder (experiences, educations, skills, languages + dynamic field arrays)
- [x] Upload CV PDF per Resume (drag & drop, 5MB limit, `/cv-files` page)
- [x] Search Jobs (q, province, jobType, experienceLevel, categoryId, salary range + pagination)
- [x] View Job Detail (+ view count increment + `hasApplied` from backend)
- [x] Apply Job (เลือก resume + cover letter, ป้องกัน duplicate, 409 on re-apply)
- [x] Save/Unsave Job (bookmark toggle, optimistic update)
- [x] Application History (ดูสถานะทุกใบสมัคร)
- [x] Saved Jobs List

### Employer
- [x] Company Profile (edit name, industry, size, description, province)
- [x] Post Job (title, description, requirements, benefits, location, jobType, salary, tags, expiresAt)
- [x] Edit Job
- [x] Change Job Status (draft/active/closed)
- [x] Delete Job
- [x] View Applicants (filter by status + pagination)
- [x] Update Application Status (pending → reviewed → shortlisted → rejected → hired)

### Admin
- [x] Dashboard Stats (total users/jobs/companies/applications, breakdown by status)
- [x] Manage Users (search, filter by role, ban/unban, delete)
- [x] Manage Jobs (search, filter by status, change status, delete)
- [x] Manage Companies (search, verify/unverify)

---

## 6. ฟีเจอร์ที่ยังไม่ implement ❌ (งานต่อไป)

| Priority | Feature | หมายเหตุ |
|----------|---------|---------|
| ~~สูง~~ | ~~Email verification~~ | **แก้แล้ว ✅** — POST /auth/verify-email, /auth/resend-verification + หน้า /auth/verify-email |
| ~~สูง~~ | ~~Rate limiting~~ | **แก้แล้ว ✅** — helmet + express-rate-limit (`generalLimiter` ทุก /api, `authLimiter` เข้มกว่าบน /auth/login, /auth/register) ผูกใน app.ts แล้ว |
| ~~สูง~~ | ~~Password reset~~ | **แก้แล้ว ✅** — POST /auth/forgot-password, /auth/reset-password + หน้า /auth/forgot-password, /auth/reset-password |
| สูง | File upload ไปยัง S3/Cloudinary | ตอนนี้เก็บ local disk — ไม่เหมาะ production |
| กลาง | Employer: update applicant note | `employerNote` มีใน schema แต่ UI ยังไม่มี text field ให้กรอก |
| ~~กลาง~~ | ~~Seeker: ดูสถานะ hasApplied ตอนโหลด job detail~~ | **แก้แล้ว ✅** — backend คืน `hasApplied` ใน GET /jobs/:id (soft-auth), frontend seed จาก response ตรงๆ |
| กลาง | Job categories CRUD ใน Admin | ตอนนี้เพิ่มผ่าน seed เท่านั้น |
| กลาง | Pagination ใน Saved Jobs | ตอนนี้ load ทั้งหมด |
| ~~ต่ำ~~ | ~~Password reset via email~~ | **แก้แล้ว ✅** ดูแถวด้านบน |
| ต่ำ | Employer logo upload | field `logoUrl` มีแต่ยังไม่มี upload UI |
| ต่ำ | Toast notifications | ตอนนี้ใช้ inline success/error message |
| ต่ำ | Global Error Boundary | มี `global-error.tsx` แล้วสำหรับ crash ทั้งหน้า แต่ยังไม่มี toast/snackbar สำหรับ error ย่อยระหว่างใช้งาน |
| ต่ำ | Automated tests (Jest) | ยังไม่มี test เลย |

---

## 7. Known Issues

1. **Prisma compound key name:** `jobSeekerId_jobId` ใน `savedJob` — ถ้า migrate แล้วชื่อไม่ตรง จะ error ตอน compile ให้ตรวจสอบใน Prisma Client ที่ generate แล้ว
2. **`useSavedJobs` re-fetch:** ตอน `save()` จะ fetch ใหม่ทั้งหมด — อาจ optimize ด้วยการ optimistic update แทน
3. **CV file delete:** `fs.unlink(..., () => {})` เป็น best-effort — DB record ลบแล้วแต่ไฟล์อาจค้างบน disk
4. ~~**hasApplied state reset on reload**~~ — **แก้แล้ว** ✅ backend ส่ง `hasApplied` field ใน `GET /jobs/:id` โดยใช้ soft-auth (`verifyAccessToken` without rejection) seeder จาก DB จริงทุกครั้งที่โหลดหน้า
5. **Admin delete user:** ถ้าลบ user ที่เป็น employer — jobs ของบริษัทนั้นจะถูกลบด้วย (cascade) — ควรมี confirm modal ที่บอกผลกระทบ
6. **TypeScript strict:** `employer.company` ใน frontend type ถูก mark เป็น required แต่ Prisma อาจคืน null ในบางกรณี — ใช้ optional chaining เสมอ
7. ~~**cv-files page ไม่มี**~~ — **แก้แล้ว** ✅ สร้าง `/cv-files` page แล้ว พร้อม drag-and-drop upload + delete + ลิสต์ไฟล์
8. **`/seeker/cv-files` และหน้าอื่นใต้ `/seeker/*`:** layout guard เช็คเฉพาะ role ไม่ได้ล็อค path ย่อยแต่ละอัน — ถ้ามีคนเพิ่มหน้าใหม่ใต้ `app/seeker/` โดยตั้งใจให้เป็น public จะถูก guard บังคับ login ไปด้วยอัตโนมัติ (เพราะ guard อยู่ที่ `seeker/layout.tsx` ครอบทุกอย่างข้างใต้)
9. **Route groups ถูกแทนที่ด้วยโฟลเดอร์จริงแล้ว (ดูหัวข้อ 3)** — ถ้าจะเพิ่มหน้าใหม่ ห้ามใช้ `(groupName)` อีก ให้สร้างเป็นโฟลเดอร์จริงใต้ `auth/`, `seeker/`, `employer/`, หรือ `admin/` เท่านั้น เพื่อไม่ให้ bug เดิม (URL ชนกัน) กลับมาอีก

---

## 8. Environment Variables

### Backend
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/jobboard
JWT_SECRET=                    # openssl rand -hex 32
JWT_REFRESH_SECRET=            # openssl rand -hex 32
PORT=5000
CLIENT_URL=http://localhost:3000
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880          # 5MB in bytes
NODE_ENV=development
```

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 9. คำสั่งที่ใช้บ่อย

```bash
# Backend
cd backend
npm run dev                                    # dev server (ts-node-dev)
npx prisma migrate dev --name <description>    # สร้าง migration หลังแก้ schema
npx prisma generate                            # gen Prisma Client ใหม่
npx prisma studio                              # GUI ดูข้อมูล
npx ts-node prisma/seed.ts                     # seed categories + demo accounts

# Frontend
cd frontend
npm run dev                                    # Next.js dev
npm run build                                  # ตรวจ type + build ก่อน deploy

# Production
docker compose up -d --build
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx ts-node prisma/seed.ts
docker compose logs -f backend
```

---

## 10. สำหรับ Agent ที่มาทำงานต่อ

- อ่าน **หัวข้อ 6 (ยังไม่ implement)** และ **หัวข้อ 7 (Known Issues)** ก่อนเริ่มทุกครั้ง
- เวลาเพิ่ม API endpoint ใหม่ — ทำตาม pattern `service → controller → routes` เสมอ
- เวลาเพิ่ม field ใน Prisma schema — ต้องอัปเดต `frontend/src/types/index.ts` ด้วยมือ (ไม่มี code-gen)
- ทำ syntax check ด้วย brace/paren balance ก่อนส่งเสมอ (environment นี้ไม่มี network install)
- อัปเดตหัวข้อ 5 และ 6 ในไฟล์นี้ทุกครั้งที่ feature เสร็จ — ห้ามให้เอกสารเพี้ยนจากโค้ดจริง
