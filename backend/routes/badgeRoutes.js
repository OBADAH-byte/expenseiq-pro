const express = require('express');
const router = express.Router();
const { getUserBadges, awardBadge } = require('../controllers/badgeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getUserBadges);
router.post('/award', awardBadge);

module.exports = router;
