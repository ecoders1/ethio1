# 🎓 Exit Exam Ethiopia

**Ethiopia's Premier University Exit Exam Preparation Platform**

> Prepare Today, Succeed Tomorrow

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://vercel.com)

---

## Features

- **22+ Departments** — Technology, Health Sciences, Business, Engineering, and more
- **Practice Questions** — Thousands of MCQ and True/False questions
- **Mock Exams** — Timed, full-screen exam simulation with tab-switch detection
- **Previous Exit Exams** — Real past papers from 2021–2024
- **Performance Analytics** — Score charts, pass/fail breakdown, time tracking
- **Certificates** — Auto-generated on passing, downloadable PDF
- **Admin Panel** — Full CRUD for students, exams, questions, materials, notifications
- **Dark / Light Mode** — Smooth theme switching
- **Mobile-First** — Works on Android, iPhone, tablet, laptop, desktop
- **SEO Optimized** — OpenGraph, metadata, fast loading

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + Glassmorphism |
| Animations | Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + Google OAuth |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| PDF | jsPDF + html2canvas |
| Hosting | Vercel |

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/exit-exam-ethiopia.git
cd exit-exam-ethiopia
npm install
```

### 2. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Run `supabase/schema.sql` in the Supabase SQL Editor.  
This creates all tables, RLS policies, triggers, and seeds the 22 departments.

### 4. Create Admin

After signing up, run in Supabase SQL Editor:

```sql
update public.users
set role = 'super_admin'
where email = 'your@email.com';

update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"role":"super_admin"}'
where email = 'your@email.com';
```

### 5. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment (Vercel)

1. Push to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in Vercel Dashboard → Settings → Environment Variables
4. Deploy

---

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/         # Student pages (layout with sidebar)
│   │   ├── dashboard/       # Home dashboard
│   │   ├── exams/           # Exam browser
│   │   ├── exam/[id]/       # Exam interface (full-screen)
│   │   ├── departments/     # Department list + detail
│   │   ├── results/         # Results list + detail
│   │   ├── materials/       # Study materials
│   │   └── profile/         # User profile
│   ├── admin/               # Admin panel
│   │   ├── dashboard/       # Stats + charts
│   │   ├── students/        # Student management
│   │   ├── exams/           # Exam CRUD
│   │   ├── questions/       # Question bank
│   │   ├── departments/     # Department management
│   │   ├── materials/       # File management
│   │   ├── results/         # Results + export
│   │   ├── notifications/   # Send notifications
│   │   ├── certificates/    # Certificate management
│   │   └── settings/        # Platform settings
│   ├── auth/                # Sign in / Sign up / Forgot password
│   ├── welcome/             # Landing page
│   └── page.tsx             # Splash screen
├── components/
│   ├── layout/              # Sidebar, TopBar, BottomNav
│   ├── admin/               # AdminSidebar
│   └── providers/           # ThemeProvider
└── lib/
    ├── supabase/            # Client, server, middleware
    ├── types.ts             # TypeScript interfaces
    ├── constants.ts         # Departments, features, stats
    └── utils.ts             # Helper functions
```

---

## License

MIT © 2026 Exit Exam Ethiopia
