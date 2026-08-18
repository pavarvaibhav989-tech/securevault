const express = require('express');
const router = express.Router();
const { generateHashEndpoint, verifyHashEndpoint, avalancheDemo, getHashHistory, birthdayAttack } = require('../controllers/hashController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.post('/generate', optionalAuth, ...generateHashEndpoint);
router.post('/verify', verifyHashEndpoint);
router.post('/avalanche', avalancheDemo);
router.post('/birthday', birthdayAttack);
router.get('/history', protect, getHashHistory);

module.exports = router;
