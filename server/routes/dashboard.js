const express = require('express');
const router = express.Router();
const { getDashboard, getAllUsers, deleteUser } = require('../controllers/dashboardController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getDashboard);
router.get('/admin/users', protect, adminOnly, getAllUsers);
router.delete('/admin/users/:id', protect, adminOnly, deleteUser);

module.exports = router;
