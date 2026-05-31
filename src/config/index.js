// ============================================
// QuickApply.AI — Centralized Configuration
// ============================================

require('dotenv').config({ override: true });

const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 5000,
  env: process.env.NODE_ENV || 'development',

  // MongoDB
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quickapply',

  // Gemini AI
  geminiApiKey: process.env.GEMINI_API_KEY,

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB

  // Puppeteer
  puppeteerHeadless: process.env.PUPPETEER_HEADLESS !== 'false',

  // Upload directory
  uploadDir: require('path').join(__dirname, '..', '..', 'uploads'),
};

module.exports = config;
