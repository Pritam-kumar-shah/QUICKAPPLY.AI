// ============================================
// QuickApply.AI — AI-Powered Job Application Platform
// "Stop filling forms, start getting interviews." 🚀
//
// Powered by Google Gemini AI + Puppeteer Automation
// ============================================

// 🌟 (Final MongoDB Server Injection Reload)

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Config
const config = require('./config/index');
const connectDB = require('./config/database');
const { initGemini } = require('./config/gemini');

// Middleware
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// ============================================
// Initialize Express App
// ============================================
const app = express();

// ============================================
// Security & Utility Middleware
// ============================================

// CORS — allow all origins for hackathon
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Helmet — security headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// Request logging
app.use(morgan('dev'));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // generous for hackathon
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Static files (for uploaded resumes/screenshots)
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Serve local demo form static assets
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
app.use('/public', express.static(publicDir));

// ============================================
// API Routes
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'QuickApply.AI is running! 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.env,
    services: {
      geminiAI: config.geminiApiKey && config.geminiApiKey !== 'YOUR_GEMINI_API_KEY_HERE' ? 'connected' : 'mock-mode',
      database: 'checking...',
      puppeteer: 'ready',
    },
  });
});

// API info / welcome route
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    project: 'QuickApply.AI',
    tagline: 'Stop filling forms, start getting interviews. 🚀',
    version: '1.0.0',
    description: 'AI-powered job application automation platform using Google Gemini API',
    features: [
      '🤖 AI Resume Analysis & Optimization (Gemini)',
      '🎯 Hyper-Personalized Job Matching',
      '⚡ One-Click Auto-Apply (Puppeteer)',
      '📊 ATS Score Tracking',
      '✉️  AI Cover Letter Generation',
      '📚 AI Interview Preparation',
      '📦 Bulk Auto-Apply',
    ],
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Create a new account',
        'POST /api/auth/login': 'Login to your account',
        'GET  /api/auth/me': 'Get your profile (🔒)',
        'PUT  /api/auth/preferences': 'Update job preferences (🔒)',
      },
      resume: {
        'POST /api/resume/upload': 'Upload & AI-analyze resume (🔒)',
        'POST /api/resume/optimize': 'Optimize resume for a job (🔒)',
        'GET  /api/resume/ats-score': 'Get ATS compatibility score (🔒)',
      },
      jobs: {
        'GET  /api/jobs': 'Browse all jobs (with filters)',
        'GET  /api/jobs/details/:id': 'Get job details',
        'GET  /api/jobs/match/me': 'AI-matched jobs for you (🔒)',
        'POST /api/jobs/search/ai': 'AI-generated search queries (🔒)',
      },
      apply: {
        'POST /api/apply/one-click': '⚡ One-Click Auto-Apply (🔒)',
        'POST /api/apply/bulk': '📦 Bulk Auto-Apply (🔒)',
        'GET  /api/apply/history': 'Application history (🔒)',
        'POST /api/apply/interview-prep/:jobId': '📚 Interview prep (🔒)',
      },
      dashboard: {
        'GET  /api/dashboard': 'Dashboard overview (🔒)',
        'GET  /api/dashboard/insights': 'AI career insights (🔒)',
      },
    },
    note: '🔒 = Requires Bearer token. Get one via /api/auth/register or /api/auth/login',
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/apply', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ============================================
// 404 Handler
// ============================================
app.use('{*path}', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found. Visit /api for documentation.`,
  });
});

// ============================================
// Global Error Handler
// ============================================
app.use(errorHandler);

// ============================================
// Start Server
// ============================================
const startServer = async () => {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║         QuickApply.AI — Starting Server          ║');
  console.log('║   "Stop filling forms, start getting interviews" ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');

  // Connect to MongoDB (graceful — works without it)
  await connectDB();

  // Initialize Gemini AI
  initGemini();

  // Start listening
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log('');
    console.log(`🚀 Server running on: http://localhost:${PORT}`);
    console.log(`📖 API Docs:          http://localhost:${PORT}/api`);
    console.log(`❤️  Health Check:      http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment:       ${config.env}`);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Ready to revolutionize job applications! 🎯');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
  });
};

startServer().catch(console.error);

module.exports = app; // For testing
