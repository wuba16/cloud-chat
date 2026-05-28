// src/lib/notifications.js
import { getToken }      from 'firebase/messaging';
import { doc, setDoc }  from 'firebase/firestore';
import { messaging, db } from './firebase';

const VAPID = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/** Call this after a user signs in.
 *  Asks for browser notification permission, gets the FCM
 *  device token, and saves it to Firestore so Cloud Functions
 *  can look it up when sending push notifications. */
export async function requestAndSaveFCMToken(userId) {
  if (!messaging) {
    console.warn('FCM not supported in this browser');
    return null;
  }
  try {
    // Step 1 — ask the browser for permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied by user');
      return null;
    }

    // Step 2 — register the service worker (must be in /public)
    const swReg = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js'
    );

    // Step 3 — get the FCM token for this device/browser
    const token = await getToken(messaging, {
      vapidKey: VAPID,
      serviceWorkerRegistration: swReg,
    });

    if (!token) {
      console.warn('No FCM token returned');
      return null;
    }

    // Step 4 — save token to Firestore under users/{userId}
    await setDoc(
      doc(db, 'users', userId),
      { fcmToken: token, tokenUpdatedAt: new Date() },
      { merge: true }
    );
    console.log('FCM token saved to Firestore');
    return token;
  } catch (err) {
    console.error('FCM token error:', err);
    return null;
  }
}