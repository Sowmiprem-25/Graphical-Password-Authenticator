const express = require('express');
const router = express.Router();
const { getLogs, getAlerts, getStats, unlockUser } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require authentication and admin privileges
router.use(protect);
router.use(adminOnly);

// GET /admin/stats
router.get('/stats', getStats);

// GET /admin/logs
router.get('/logs', getLogs);

// GET /admin/alerts
router.get('/alerts', getAlerts);

// PATCH /admin/users/:id/unlock
router.patch('/users/:id/unlock', unlockUser);

module.exports = router;
