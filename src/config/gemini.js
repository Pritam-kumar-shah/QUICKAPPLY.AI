// ============================================
// ApplyFlow.ai — Gemini AI Client Setup
// ============================================

const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./index');

let genAI = null;
let model = null;

const initGemini = () => {
  if (!config.geminiApiKey || config.geminiApiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('⚠️  Gemini API Key not configured. AI features will use mock responses.');
    return null;
  }

  try {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('✅ Gemini AI initialized successfully');
    return model;
  } catch (error) {
    console.error('❌ Gemini AI init failed:', error.message);
    return null;
  }
};

const getModel = () => {
  if (!model) initGemini();
  return model;
};

module.exports = { initGemini, getModel };
