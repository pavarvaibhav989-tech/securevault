const express = require('express');
const router = express.Router();
const {
  register, login, logout, verifyOTP, resendOTP,
  forgotPassword, resetPassword, getMe, getLoginHistory,
  updateProfile, changePassword, getAllUsersAdmin, deleteUserAdmin,
  toggleBanAdmin, changeRoleAdmin,
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', protect, logout);
router.post('/verify-otp', otpLimiter, verifyOTP);
router.post('/resend-otp', otpLimiter, resendOTP);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/me', protect, getMe);
router.get('/login-history', protect, getLoginHistory);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/users', protect, adminOnly, getAllUsersAdmin);
router.delete('/users/:id', protect, adminOnly, deleteUserAdmin);
router.patch('/users/:id/ban', protect, adminOnly, toggleBanAdmin);
router.patch('/users/:id/role', protect, adminOnly, changeRoleAdmin);

module.exports = router;
