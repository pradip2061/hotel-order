const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const controller = require('../controller/notificationController');

// Register a device token for current user
router.post('/register', verifyToken, controller.registerToken);

// Unregister a device token
router.post('/unregister', verifyToken, controller.unregisterToken);


module.exports = router;
