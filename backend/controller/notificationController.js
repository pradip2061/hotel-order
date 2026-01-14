const User = require('../model/userModel');
const admin = require('../firebaseAdmin');

// Register device token for the authenticated user
const registerToken = async (req, res) => {
  try {
    // Accept FCM token from custom header `x-fcm-token` or body.token for backward compatibility
    const fcmToken = req.headers['x-fcm-token'] || req.body && req.body.token;
    if (!fcmToken) return res.status(400).json({ message: 'FCM token is required' });

    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.fcmTokens = user.fcmTokens || [];
    if (!user.fcmTokens.includes(fcmToken)) user.fcmTokens.push(fcmToken);
    await user.save();

    res.json({ message: 'Token registered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
