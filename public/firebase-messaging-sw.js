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

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body: body,
    icon: '/logo192.png',
  });
});