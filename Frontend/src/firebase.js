import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { registerPushToken } from "./utils/pushNotification";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

/**
 * Call this ONCE on app mount
 */
export const generateToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const newToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (!newToken) return;

    const oldToken = localStorage.getItem("fcm_token");

    // 🔁 Token refreshed
    if (oldToken && oldToken !== newToken) {
      localStorage.removeItem("fcm_registered");
    }

    localStorage.setItem("fcm_token", newToken);

    const authToken = localStorage.getItem("token");
    if (authToken) {
      await registerPushToken(newToken);
    }
  } catch (err) {
    console.error("FCM token error:", err);
  }
};
