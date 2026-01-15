const User = require('../model/userModel');
const admin = require('../config/firebaseAdmin');

// Register device token for the authenticated user
const registerToken = async (req, res) => {
  try {
    // 1️⃣ Get FCM token (header preferred, body fallback)
    const fcmToken = req.body.fcmToken 
    console.log(fcmToken,"token fcm")
    if (!fcmToken) {
      return res.status(400).json({ message: "FCM token is required" });
    }

    // 2️⃣ Auth check
    const userId = req.user?.id || req.user;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 3️⃣ Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4️⃣ Initialize token array if missing
    if (!Array.isArray(user.fcmTokens)) {
      user.fcmTokens = [];
    }

    // 5️⃣ Remove empty / invalid tokens (optional cleanup)
    user.fcmTokens = user.fcmTokens.filter(Boolean);

    // 6️⃣ Add token if not already stored
    if (!user.fcmTokens.includes(fcmToken)) {
      user.fcmTokens.push(fcmToken);
      await user.save();
    }

    return res.json({
      message: "FCM token registered successfully",
      totalTokens: user.fcmTokens.length,
    });

  } catch (err) {
    console.error("FCM Register Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// Unregister device token
const unregisterToken = async (req, res) => {
  try {
    // Accept FCM token from custom header `x-fcm-token` or body.token
    const fcmToken = req.headers['x-fcm-token'] || req.body && req.body.token;
    if (!fcmToken) return res.status(400).json({ message: 'FCM token is required' });

    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await User.findByIdAndUpdate(userId, { $pull: { fcmTokens: fcmToken } });
    res.json({ message: 'Token removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  registerToken,
  unregisterToken
};
