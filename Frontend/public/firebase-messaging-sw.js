importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// NOTE: Service worker is a static file served from the root. You cannot use
// `import.meta.env` here. Use the same firebase config values used in the app.
firebase.initializeApp({
  apiKey: "AIzaSyD77SwELcB5kAopBtQy3XkrRtHMYAwUP_s",
  authDomain: "chiyaguff-67de9.firebaseapp.com",
  projectId: "chiyaguff-67de9",
  storageBucket: "chiyaguff-67de9.firebasestorage.app",
  messagingSenderId: "657420847498",
  appId: "1:657420847498:web:d357ac3cc5ae677c876073",
  measurementId: "G-RLB1PB1KPX",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const title = (payload.notification && payload.notification.title) || 'Notification';
  const options = {
    body: (payload.notification && payload.notification.body) || '',
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});