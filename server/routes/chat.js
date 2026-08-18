const express = require('express');
const router = express.Router();
const { getChatUsers, getMessages, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/users', protect, getChatUsers);
router.get('/messages/:userId', protect, getMessages);
router.post('/send', protect, sendMessage);

module.exports = router;
