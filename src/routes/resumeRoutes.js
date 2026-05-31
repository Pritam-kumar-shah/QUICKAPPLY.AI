// ============================================
// ApplyFlow.ai — Resume Routes
// ============================================

const express = require('express');
const router = express.Router();
const { uploadAndAnalyze, optimizeForJob, getATSScore, generateFromProfile, enhanceText, autoFillProfile } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All resume routes are protected
router.use(protect);

// Upload + Analyze resume (one-shot)
router.post('/upload', upload.single('resume'), uploadAndAnalyze);

// Optimize resume for a specific job
router.post('/optimize', optimizeForJob);

// AI generate resume from profile
router.post('/generate', generateFromProfile);

// AI enhance specific text
router.post('/enhance', enhanceText);

// AI magic auto-fill profile from prompt
router.post('/auto-fill', autoFillProfile);

// Get current ATS score
router.get('/ats-score', getATSScore);

module.exports = router;
