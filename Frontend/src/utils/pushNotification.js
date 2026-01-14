import axios from 'axios';
import { getToken, deleteToken } from 'firebase/messaging';
import { messaging } from '../firebase';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const VAPID_KEY = import.meta.env.VITE_VAPID_KEY; // optional

async function requestPermission() {
  if (!('Notification' in window)) return { granted: false, reason: 'unsupported' };
  const permission = await Notification.requestPermission();
  return { granted: permission === 'granted', permission };
}

export async function registerPushToken() {
  try {
    const { granted } = await requestPermission();
    if (!granted) return { ok: false, message: 'permission_denied' };

    let currentToken;
    try {
      if (VAPID_KEY) currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      else currentToken = await getToken(messaging);
    } catch (err) {
      return { ok: false, message: 'get_token_failed', error: err.message };
    }

    if (!currentToken) return { ok: false, message: 'no_token_returned' };

    const token = localStorage.getItem('token');
    if (!token) return { ok: false, message: 'no_auth_token' };

    await axios.post(`${BASE_URL}/chiyaguff/notifications/register`, {}, { headers: { Authorization: token, 'x-fcm-token': currentToken } });
    localStorage.setItem('fcm_token', currentToken);
    return { ok: true, token: currentToken };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function unregisterPushToken() {
  try {
    const currentToken = localStorage.getItem('fcm_token');
    if (!currentToken) return { ok: false, message: 'no_token_stored' };
    const token = localStorage.getItem('token');
    if (!token) return { ok: false, message: 'no_auth_token' };

    await axios.post(`${BASE_URL}/chiyaguff/notifications/unregister`, {}, { headers: { Authorization: token, 'x-fcm-token': currentToken } });
    try { await deleteToken(messaging); } catch (_) {}
    localStorage.removeItem('fcm_token');
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

