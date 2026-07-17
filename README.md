# AI Code Review Assistant

> A full-stack web application that reviews your code using static analysis + AI (Claude) to detect bugs, security issues, performance problems, and more.

---

## 🚀 Features

- **User Auth** — Register, Login, Profile, Change Password (JWT)
- **Paste Code** — Paste any code snippet for instant review
- **Upload File** — Upload .js .ts .py .java .cpp .cs files
- **Static Analysis** — Rule-based detection for JS, TypeScript, Python, Java
- **AI Review** — Claude AI detects bugs, security issues, performance problems
- **Complexity Metrics** — Lines of code, functions, classes, cyclomatic complexity
- **Review Dashboard** — View, search, filter, delete all past reviews
- **Severity Levels** — Critical 🚨 / Warning ⚠️ / Info ℹ️
- **Suggested Fixes** — Every issue includes a specific fix

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Supabase) |
| Auth | JWT |
| AI | Anthropic Claude API |
| Deployment | Vercel + Render |

---

## ⚙️ Setup

### 1. Database (Supabase)
1. Create project at https://supabase.com
2. Run `backend/src/db/schema.sql` in Supabase SQL Editor

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

**backend/.env:**
```env
DATABASE_URL=postgresql://postgres.xxxx:password@aws-x-ap-southeast-1.pooler.supabase.com:6543/postgres
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ANTHROPIC_API_KEY=sk-ant-xxxx   # Get from console.anthropic.com
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000

---

## 🔑 Get Anthropic API Key

1. Go to https://console.anthropic.com
2. Sign up / Login
3. Go to **API Keys** → **Create Key**
4. Copy and paste into `backend/.env` as `ANTHROPIC_API_KEY`

> **Note:** Without the API key, static analysis still works. AI review will show a fallback message.

---

## 📡 API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get profile |
| PUT | /api/auth/profile | Update profile |
| PUT | /api/auth/change-password | Change password |

### Reviews
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/reviews | List all reviews |
| POST | /api/reviews | Submit code for review |
| POST | /api/reviews/upload | Upload file for review |
| GET | /api/reviews/stats | Dashboard stats |
| GET | /api/reviews/:id | Get review details |
| DELETE | /api/reviews/:id | Delete review |

---

## 🗂️ Project Structure

```
ai-code-review/
├── frontend/
│   ├── app/
│   │   ├── auth/login/         # Login page
│   │   ├── auth/register/      # Register page
│   │   ├── dashboard/          # Review history dashboard
│   │   ├── new-review/         # Submit code for review
│   │   ├── review/[id]/        # Review results page
│   │   └── profile/            # User profile settings
│   └── package.json
│
└── backend/
    ├── src/
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   └── reviewController.js
    │   ├── services/
    │   │   ├── staticAnalyzer.js   # Rule-based analysis engine
    │   │   └── aiReviewer.js       # Claude AI integration
    │   ├── middleware/auth.js
    │   ├── routes/index.js
    │   ├── db/
    │   │   ├── schema.sql
    │   │   └── connection.js
    │   └── index.js
    └── package.json
```

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd frontend
# Set env: NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
vercel
```

### Backend → Render
- Root: `backend/`
- Build: `npm install`
- Start: `node src/index.js`
- Add all env vars from `.env.example`

---

## 🎯 Supported Languages

| Language | Static Analysis | AI Review |
|----------|----------------|-----------|
| JavaScript | ✅ Full | ✅ |
| TypeScript | ✅ Full | ✅ |
| Python | ✅ Full | ✅ |
| Java | ✅ Full | ✅ |
| C++ | ✅ Basic | ✅ |
| C# | ✅ Basic | ✅ |
| Others | ✅ Generic | ✅ |
