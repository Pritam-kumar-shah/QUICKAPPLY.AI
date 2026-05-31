// ============================================
// ApplyFlow.ai — Dashboard Routes
// ============================================

const express = require('express');
const router = express.Router();
const { getDashboard, getInsights } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getDashboard);
router.get('/insights', getInsights);

module.exports = router;
