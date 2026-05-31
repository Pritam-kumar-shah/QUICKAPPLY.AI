# 🚀 ApplyFlow.ai

### *"Stop filling forms, start getting interviews."*

---

## 🌟 What is ApplyFlow.ai?

ApplyFlow.ai is an **AI-powered job application automation ecosystem** that uses the **Google Gemini API** to:

1. **Analyze & Optimize** your resume with ATS-friendly keywords
2. **Find best-matching jobs** using hyper-personalized AI matching  
3. **Auto-apply in one click** — zero manual form filling with Puppeteer automation

---

## 🏆 Unique Selling Points (Hackathon)

| Feature | Description |
|---------|-------------|
| **🤖 AI-Driven Optimization** | Gemini doesn't just extract data — it **live-optimizes** your resume with ATS keywords |
| **⚡ Zero-Form Interaction** | Users don't fill a single field — Puppeteer automation handles everything |
| **🎯 Hyper-Personalized Matching** | AI tells you **WHY** you're a fit, not just keyword matching |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js + Express.js |
| AI Engine | Google Gemini 2.0 Flash API |
| Database | MongoDB + Mongoose |
| Automation | Puppeteer (Headless Chrome) |
| Auth | JWT + bcrypt |
| File Processing | Multer + pdf-parse |
| Security | Helmet, CORS, Rate Limiting |

---

## 📁 Project Structure

```
Flow.Ai/
├── src/
│   ├── config/
│   │   ├── index.js          # Centralized config
│   │   ├── database.js       # MongoDB connection
│   │   └── gemini.js         # Gemini AI client
│   ├── models/
│   │   ├── User.js           # User model (profile, resume, prefs)
│   │   ├── Job.js            # Job listings model
│   │   └── Application.js    # Application tracking model
│   ├── services/
│   │   ├── geminiService.js   # 🧠 Core AI Engine (6 AI features)
│   │   ├── resumeParser.js    # PDF text extraction
│   │   ├── jobMatchingService.js # Job matching algorithm
│   │   └── autoApplyService.js   # ⚡ Puppeteer automation
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── resumeController.js
│   │   ├── jobsController.js
│   │   ├── applicationController.js
│   │   └── dashboardController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── resumeRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── applicationRoutes.js
│   │   └── dashboardRoutes.js
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   ├── upload.js          # Multer file upload
│   │   └── errorHandler.js    # Global error handler
│   ├── scripts/
│   │   └── seedJobs.js        # Database seeder
│   └── server.js              # Entry point
├── .env                       # Environment variables
├── .env.example               # Example env file
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Edit .env file and add your Gemini API key
GEMINI_API_KEY=your_actual_gemini_api_key
```

### 3. Start the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 4. (Optional) Seed Database
```bash
npm run seed
```

> **Note:** The server works **without MongoDB** — it falls back to in-memory storage. Perfect for hackathon demos!

---

## 📡 API Endpoints

### 🔓 Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api` | API documentation |
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/jobs` | Browse jobs (with filters) |
| GET | `/api/jobs/details/:id` | Job details |

### 🔒 Protected Endpoints (Require Bearer Token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get profile |
| PUT | `/api/auth/preferences` | Update preferences |
| POST | `/api/resume/upload` | Upload & AI-analyze resume |
| POST | `/api/resume/optimize` | Optimize resume for a job |
| GET | `/api/resume/ats-score` | Get ATS score |
| GET | `/api/jobs/match/me` | AI-matched jobs |
| POST | `/api/jobs/search/ai` | AI search queries |
| **POST** | **`/api/apply/one-click`** | **⚡ One-Click Auto-Apply** |
| POST | `/api/apply/bulk` | Bulk auto-apply |
| GET | `/api/apply/history` | Application history |
| POST | `/api/apply/interview-prep/:jobId` | Interview prep |
| GET | `/api/dashboard` | Dashboard overview |
| GET | `/api/dashboard/insights` | AI career insights |

---

## 🧪 Test API (cURL Examples)

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Rohit Kumar","email":"rohit@test.com","password":"password123"}'
```

### Upload Resume
```bash
curl -X POST http://localhost:5000/api/resume/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "resume=@./myresume.pdf"
```

### One-Click Apply ⚡
```bash
curl -X POST http://localhost:5000/api/apply/one-click \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jobId":"job_001"}'
```

### Get Matched Jobs
```bash
curl http://localhost:5000/api/jobs/match/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🤖 AI Features (Powered by Gemini)

1. **Resume Analysis** — Deep parsing of resume PDF into structured data
2. **Resume Optimization** — Live rewrite with ATS-optimized keywords per job
3. **Job Matching** — Personalized match score + "Why You Fit" explanation
4. **Cover Letter Generation** — Tailored cover letter for each job
5. **Interview Preparation** — Technical + behavioral questions with answers
6. **Smart Job Search** — AI-generated search queries for job boards

---

## 📊 Architecture Flow

```
User Uploads Resume
      │
      ▼
  PDF Parser (pdf-parse)
      │
      ▼
  Gemini AI Analysis ──────┐
      │                    │
      ▼                    ▼
  Structured Profile    ATS Score
      │
      ▼
  Job Matching Engine ◄── Available Jobs DB
      │
      ▼
  Match Results + "Why You Fit"
      │
      ▼
  ⚡ One-Click Apply
      │
      ├── Resume Optimization (Gemini)
      ├── Cover Letter Generation (Gemini)
      ├── Form Auto-Fill (Puppeteer)
      └── Screenshot Proof
      │
      ▼
  ✅ Application Submitted!
```

---

## 🏗️ Built for Hackathon

- ✅ Works **without MongoDB** (in-memory fallback)
- ✅ Works **without Gemini API key** (intelligent mock responses)
- ✅ Works **without Puppeteer** (simulation mode)
- ✅ **Zero configuration** needed to demo
- ✅ Beautiful API responses with emojis and clear messaging

---

## 📝 License

MIT — Built with ❤️ for the Hackathon
