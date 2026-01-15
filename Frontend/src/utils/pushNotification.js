import axios from "axios";
import { deleteToken } from "firebase/messaging";
import { messaging } from "../firebase";

const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Register FCM token with backend
 */
export async function registerPushToken(fcmToken) {
  try {
    if (!fcmToken) return { ok: false, message: "no_fcm_token" };

    const authToken = localStorage.getItem("token");

    // Always store locally
    localStorage.setItem("fcm_token", fcmToken);

    // Not logged in → do NOT call backend
    if (!authToken) {
      return { ok: true, message: "stored_locally" };
    }

    /**
     * Check if this token was already registered for this login session
     * (prevents duplicate calls after refresh)
     */
    const registered = localStorage.getItem("fcm_registered");

    if (registered === "true") {
      return { ok: true, message: "already_registered" };
    }

    // Register with backend
    await axios.post(
      `${BASE_URL}/notifications/register`,
      { fcmToken },
      {
        headers: {
          Authorization: authToken,
        },
      }
    );

    // Mark as registered for this session
    localStorage.setItem("fcm_registered", "true");

    return { ok: true };
  } catch (err) {
    console.error("Register push token error:", err);
    return { ok: false, message: err.message };
  }
}

/**
 * Unregister FCM token (logout)
 */
export async function unregisterPushToken() {
  try {
    const fcmToken = localStorage.getItem("fcm_token");
    const authToken = localStorage.getItem("token");

    if (!fcmToken) return { ok: false, message: "no_fcm_token" };
    if (!authToken) return { ok: false, message: "no_auth_token" };

    await axios.post(
      `${BASE_URL}/notifications/unregister`,
      {},
      {
        headers: {
          Authorization: authToken,
          "x-fcm-token": fcmToken,
        },
      }
    );

    // Delete token from Firebase
    try {
      await deleteToken(messaging);
    } catch (_) {}

    // Cleanup
    localStorage.removeItem("fcm_token");
    localStorage.removeItem("fcm_registered");

    return { ok: true };
  } catch (err) {
    console.error("Unregister push token error:", err);
    return { ok: false, message: err.message };
  }
}
