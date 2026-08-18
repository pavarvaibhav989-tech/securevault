const express = require('express');
const router = express.Router();
const { getRules, addRule, updateRule, deleteRule, simulatePacket, seedDefaults } = require('../controllers/firewallController');
const { protect } = require('../middleware/authMiddleware');

router.get('/rules', protect, getRules);
router.post('/rules', protect, addRule);
router.put('/rules/:id', protect, updateRule);
router.delete('/rules/:id', protect, deleteRule);
router.post('/simulate', protect, simulatePacket);
router.post('/seed-defaults', protect, seedDefaults);

module.exports = router;
