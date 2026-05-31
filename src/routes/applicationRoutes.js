// ============================================
// ApplyFlow.ai — Application Routes
// ============================================

const express = require('express');
const router = express.Router();
const { oneClickApply, bulkApply, getApplicationHistory, getInterviewPrep, getSkillGap, streamLogs } = require('../controllers/applicationController');
const { startInterview, submitAnswer } = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

// All application routes are protected
router.use(protect);

// ⚡ THE HERO: One-Click Auto-Apply
router.post('/one-click', oneClickApply);

// SSE Log Stream for Puppeteer live updates
router.get('/live-stream', streamLogs);

// AI Interview Simulator
router.post('/interview/start', startInterview);
router.post('/interview/answer', submitAnswer);

// Bulk apply
router.post('/bulk', bulkApply);

// Application history
router.get('/history', getApplicationHistory);

// Interview prep for a specific job
router.post('/interview-prep/:jobId', getInterviewPrep);

// 📊 Skill Gap Analysis
router.post('/skill-gap/:jobId', getSkillGap);

module.exports = router;
