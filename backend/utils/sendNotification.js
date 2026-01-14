const admin = require("../firebaseAdmin");
const User = require("../model/userModel");

/**
 * Send notifications to users
 * @param {Object} options
 * @param {Array<string>} [options.userIds] - MongoDB user IDs
 * @param {Array<string>} [options.tokens] - Direct FCM tokens
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body
 * @param {Object} [options.data] - Extra payload (must be strings)
 * @param {Object} [options.io] - Socket.IO instance (optional)
 */
const sendNotification = async ({
  userIds = [],
  tokens = [],
  title = "Notification",
  body = "",
  data = {},
  io = null,
}) => {
  try {
    const finalTokens = [...tokens]; // start with any direct tokens

    if (Array.isArray(userIds) && userIds.length) {
      const users = await User.find({ _id: { $in: userIds } });

      for (const user of users) {
        let skipUser = false;

        // Skip users if they are online (Socket.IO instance provided)
        if (io && user._id && user.role) {
          // optional: check if role room exists
          const roleRoom = io.sockets.adapter.rooms.get(user.role);
          if (roleRoom && roleRoom.size > 0) skipUser = true;
        }

        // Add only offline users' FCM tokens
        if (!skipUser && Array.isArray(user.fcmTokens)) {
          finalTokens.push(...user.fcmTokens);
        }
      }
    }

    // Remove duplicate tokens
    const uniqueTokens = [...new Set(finalTokens)];

    if (!uniqueTokens.length) return; // nothing to send

    // Prepare FCM payload
    const message = {
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
    };

    // Send FCM
    if (uniqueTokens.length === 1) {
      await admin.messaging().send({ token: uniqueTokens[0], ...message });
    } else {
      await admin.messaging().sendMulticast({ tokens: uniqueTokens, ...message });
    }

  } catch (err) {
    console.error("sendNotification error:", err.message);
  }
};

module.exports = sendNotification;
