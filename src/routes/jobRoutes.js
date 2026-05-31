// ============================================
// ApplyFlow.ai — Job Routes
// ============================================

const express = require('express');
const router = express.Router();
const { getJobs, getJobById, getMatchedJobs, aiJobSearch } = require('../controllers/jobsController');
const { protect } = require('../middleware/auth');

// Public: Browse jobs
router.get('/', getJobs);
router.get('/details/:id', getJobById);

// Protected: AI features
router.get('/match/me', protect, getMatchedJobs);
router.post('/search/ai', protect, aiJobSearch);

module.exports = router;
