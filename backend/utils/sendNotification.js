import admin from "../config/firebaseAdmin.js";
import User from "../model/userModel.js";

/**
 * Send push notification to multiple users
 * @param {string[]} userIds - array of user IDs
 * @param {Object} payload - { title, body, data }
 */
export const sendNotification = async (userIds, payload) => {
  if (!Array.isArray(userIds) || userIds.length === 0) return;

  // 1️⃣ Fetch all users in one query
  const users = await User.find({ _id: { $in: userIds } });

  // 2️⃣ Prepare tokens map
  const userTokenMap = users.reduce((acc, user) => {
    if (user.fcmTokens?.length) acc[user._id.toString()] = user.fcmTokens;
    return acc;
  }, {});

  const allTokens = Object.values(userTokenMap).flat();
  if (!allTokens.length) return;

  // 3️⃣ Create message
  const message = {
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: payload.data || {},
    tokens: allTokens,
  };

  // 4️⃣ Send multicast
  const response = await admin.messaging().sendEachForMulticast(message);

  // 5️⃣ Cleanup invalid tokens per user
  const newUserTokens = { ...userTokenMap };

  response.responses.forEach((res, index) => {
    const token = allTokens[index];
    const userId = Object.keys(userTokenMap).find((uid) =>
      userTokenMap[uid].includes(token)
    );

    if (!userId) return;

    if (!res.success) {
      const code = res.error?.code;
      if (code === "messaging/registration-token-not-registered") {
        // Remove invalid token
        newUserTokens[userId] = newUserTokens[userId].filter((t) => t !== token);
      }
    }
  });

  // 6️⃣ Save updated tokens
  for (const uid in newUserTokens) {
    const user = users.find((u) => u._id.toString() === uid);
    if (user) {
      user.fcmTokens = newUserTokens[uid];
      await user.save();
    }
  }
};
