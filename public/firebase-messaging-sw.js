// public/firebase-messaging-sw.js
// This file CANNOT use import.meta.env — it runs as a service worker.
// Paste your real Firebase values directly here (these are safe in a SW).

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyCdJ9ceo7p12gsjKHnHVWYKc8POQJsgAI4",
  authDomain:        "cloud-chat-app-e11bb.firebaseapp.com",
  projectId:         "cloud-chat-app-e11bb",
  storageBucket:     "cloud-chat-app-e11bb.firebasestorage.app",
  messagingSenderId: "98919580203",
  appId:             "1:98919580203:web:482fa55a5fecbf2e4ca06e",
});

const messaging = firebase.messaging();

// This runs when the app is in the background (tab is hidden or closed).
// It shows the push notification in the OS notification tray.
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/logo192.png',
  });
});