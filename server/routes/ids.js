const express = require('express');
const router = express.Router();
const { getLogs, detectAttack, getStats, deleteLog } = require('../controllers/idsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/logs', protect, getLogs);
router.post('/detect', protect, detectAttack);
router.get('/stats', protect, getStats);
router.delete('/logs/:id', protect, adminOnly, deleteLog);

module.exports = router;
