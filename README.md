# JobBoard — Production-Ready Job Board Platform

แพลตฟอร์มหางานและสรรหาบุคลากรครบวงจร สร้างด้วย Next.js 15 + Express + PostgreSQL

---

## Tech Stack

| Layer      | Technology                                          |
|------------|-----------------------------------------------------|
| Frontend   | Next.js 15, TypeScript, TailwindCSS, Zustand        |
| Backend    | Node.js, Express, Prisma ORM, TypeScript            |
| Database   | PostgreSQL 16                                       |
| Auth       | JWT (access token in-memory + refresh httpOnly cookie) |
| File Upload| Multer → local disk (swap to S3 for production)     |
| Security   | Helmet, express-rate-limit, bcrypt (12 rounds)      |
| Deploy     | Docker Compose + Nginx, GitHub Actions CI/CD        |

---

## Features

### Job Seeker
- Register / Login (with role toggle + password strength)
- Profile management
- Resume Builder (experiences, education, skills, languages)
- Upload CV as PDF
- Search & filter jobs (keyword, location, type, category, salary)
- Apply to jobs with resume + cover letter
- Save / Unsave jobs (bookmark)
- Track application status

### Employer
- Company profile management
- Post jobs (with draft → publish flow)
- Edit / close / reopen job postings
- View applicants with filter by status
- Update applicant status (pending → reviewed → shortlisted → rejected → hired)

### Admin
- Dashboard with system-wide stats
- Manage users (search, filter by role, ban/unban, delete)
- Manage job postings (status change, delete)
- Manage companies (verify / unverify)

---

## Quick Start (Development)

### Prerequisites
- Node.js ≥ 20
- Docker Desktop (for PostgreSQL)

### 1. Clone & Setup
```bash
git clone https://github.com/your-org/jobboard.git
cd jobboard
```

### 2. Start PostgreSQL
```bash
docker run --name jobboard-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=jobboard \
  -p 5432:5432 -d postgres:16
```

### 3. Backend
```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# .env is pre-filled with development defaults — just works with the Docker command above

# Run database migrations + generate Prisma client
npx prisma migrate dev --name init
npx prisma generate

# Seed demo data
npx ts-node prisma/seed.ts

# Start dev server
npm run dev
# → http://localhost:5000
# → http://localhost:5000/api/health
```

### 4. Frontend
```bash
# Open a new terminal
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Demo Accounts (from seed)
| Role     | Email                  | Password    |
|----------|------------------------|-------------|
| Admin    | admin@jobboard.com     | Admin@1234  |
| Employer | employer@demo.com      | Demo@1234   |
| Seeker   | seeker@demo.com        | Demo@1234   |

---

## Production Deployment (Docker Compose)

### 1. Prepare server
```bash
# On your Linux VPS
sudo apt update && sudo apt install -y docker.io docker-compose-v2 curl
```

### 2. Clone & configure
```bash
mkdir -p /opt/jobboard && cd /opt/jobboard
git clone https://github.com/your-org/jobboard.git .

# Create production environment file
cp .env.production.example .env.production

# Edit .env.production — fill in all secrets
nano .env.production
```

### 3. Generate secrets
```bash
# Generate JWT secrets (run twice for two different secrets)
openssl rand -hex 32
```

### 4. Start all services
```bash
docker compose --env-file .env.production up -d --build

# Run migrations
docker compose exec backend npx prisma migrate deploy

# Seed initial data (first time only)
docker compose exec backend npx ts-node prisma/seed.ts
```

### 5. Verify deployment
```bash
curl http://localhost:5000/api/health
# {"status":"ok","timestamp":"..."}

curl http://localhost:3000
# HTML response (Next.js)
```

### SSL/HTTPS (with Let's Encrypt)
```bash
# Install certbot
sudo apt install -y certbot

# Get certificate (standalone mode — stop nginx first)
sudo certbot certonly --standalone -d yourdomain.com

# Copy certs to nginx directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem   nginx/ssl/

# Uncomment the HTTPS block in nginx/default.conf
# Then start with production profile
docker compose --profile production up -d nginx
```

---

## API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | — | Register (seeker or employer) |
| POST | /auth/login | — | Login → returns accessToken |
| POST | /auth/logout | — | Clears refresh cookie |
| POST | /auth/refresh | — | Rotate access token |
| GET  | /auth/me | ✅ | Current user + profile |
| GET  | /jobs | — | Search jobs (paginated) |
| GET  | /jobs/:id | — | Job detail |
| POST | /jobs/:id/apply | Seeker | Apply to job |
| GET  | /jobs/categories | — | All categories |
| GET  | /seeker/profile | Seeker | Profile |
| PUT  | /seeker/profile | Seeker | Update profile |
| GET/POST | /seeker/resumes | Seeker | Resume CRUD |
| GET/PUT/DELETE | /seeker/resumes/:id | Seeker | Resume detail |
| POST | /seeker/cv/:resumeId | Seeker | Upload CV PDF |
| GET  | /seeker/applications | Seeker | Application history |
| GET/POST/DELETE | /seeker/saved-jobs | Seeker | Saved jobs |
| GET  | /employer/profile | Employer | Company profile |
| PUT  | /employer/profile | Employer | Update company |
| GET/POST | /employer/jobs | Employer | Job CRUD |
| GET/PUT/DELETE | /employer/jobs/:id | Employer | Job detail |
| PATCH | /employer/jobs/:id/status | Employer | Change job status |
| GET  | /employer/jobs/:id/applicants | Employer | Applicant list |
| PATCH | /employer/applications/:id/status | Employer | Update applicant |
| GET  | /admin/stats | Admin | Dashboard stats |
| GET/PATCH/DELETE | /admin/users/:id | Admin | User management |
| GET/PATCH/DELETE | /admin/jobs/:id | Admin | Job management |
| GET  | /admin/companies | Admin | Company list |
| PATCH | /admin/companies/:id/verify | Admin | Verify company |

---

## Project Structure

```
jobboard/
├── backend/
│   ├── prisma/schema.prisma        # Database schema + relations
│   ├── prisma/seed.ts              # Demo data seeder
│   ├── src/
│   │   ├── app.ts                  # Express entry + middleware chain
│   │   ├── config/                 # db.ts (Prisma), multer.ts
│   │   ├── middlewares/            # auth, role, validate, rateLimit, error
│   │   ├── modules/                # auth | seeker | employer | jobs | admin
│   │   ├── types/                  # AuthPayload, AuthRequest
│   │   ├── utils/                  # jwt.ts, pagination.ts
│   │   └── validators/             # All Zod schemas
│   └── Dockerfile
├── frontend/
│   ├── src/app/                    # Next.js App Router pages
│   ├── src/components/             # ui, layout, employer, resume
│   ├── src/hooks/                  # All data-fetching hooks
│   ├── src/lib/api.ts              # Axios + auto-refresh interceptor
│   ├── src/store/authStore.ts      # Zustand auth state
│   ├── src/types/                  # TypeScript type definitions
│   └── Dockerfile
├── nginx/default.conf              # Reverse proxy config
├── docker-compose.yml
├── .github/workflows/ci-cd.yml     # GitHub Actions pipeline
├── CLAUDE.md                       # AI agent documentation
└── README.md
```

---

## Security Features

- **Helmet** — sets 15+ security HTTP headers
- **Rate limiting** — 200 req/15min general, 10 attempts/15min on auth
- **bcrypt** — password hashing with 12 salt rounds
- **JWT** — short-lived access tokens (15min) + long-lived refresh in httpOnly cookie
- **Ownership checks** — every resource verified against authenticated user
- **Input validation** — all inputs through Zod schemas before reaching service layer
- **SQL injection** — impossible via Prisma parameterized queries
- **File upload** — MIME type enforcement (PDF only), 5MB size limit

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/jobboard
JWT_SECRET=                    # openssl rand -hex 32
JWT_REFRESH_SECRET=            # openssl rand -hex 32 (different from above)
PORT=5000
CLIENT_URL=http://localhost:3000
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Development Commands

```bash
# Backend
npx prisma studio              # Visual database browser
npx prisma migrate dev         # Create + apply new migration
npx prisma migrate reset       # Reset database (dev only)

# Useful Docker commands
docker compose logs -f backend    # Stream logs
docker compose exec postgres psql -U postgres jobboard  # SQL shell
docker compose down -v            # Remove everything including volumes
```

---

## Roadmap

- [ ] Email verification on register
- [ ] Password reset via email (Nodemailer/Resend)
- [ ] S3/Cloudinary file upload for production
- [ ] Push notifications when application status changes
- [ ] Job category management in Admin UI
- [ ] Resume PDF export
- [ ] Company logo upload
- [ ] Toast notifications (replace inline success/error)
- [ ] Unit + integration tests (Jest + Supertest)
- [ ] Monitoring (Prometheus + Grafana)
