const express = require('express');
const router = express.Router();
const { generateKeys, sign, verify, encrypt, decrypt, diffiHellmanDemo } = require('../controllers/rsaController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/generate-keys', generateKeys);
router.post('/sign', optionalAuth, sign);
router.post('/verify', optionalAuth, verify);
router.post('/encrypt', optionalAuth, encrypt);
router.post('/decrypt', optionalAuth, decrypt);
router.get('/diffie-hellman', diffiHellmanDemo);

module.exports = router;
