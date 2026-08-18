const express = require('express');
const router = express.Router();
const { encryptFile, decryptFile, listFiles, deleteFile } = require('../controllers/encryptionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/encrypt', protect, ...encryptFile);
router.post('/decrypt', protect, decryptFile);
router.get('/files', protect, listFiles);
router.delete('/files/:id', protect, deleteFile);

module.exports = router;
