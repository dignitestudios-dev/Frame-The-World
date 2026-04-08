import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC6LrtTPhE8q_ACFVW_mGzwXM_RhRqq0d0",
  authDomain: "frame-the-world.firebaseapp.com",
  projectId: "frame-the-world",
  storageBucket: "frame-the-world.firebasestorage.app",
  messagingSenderId: "78552630056",
  appId: "1:78552630056:web:1bc096b534255ab7d0c61d",
  measurementId: "G-E3KNH0WZB7"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider("apple.com");

// Setup FCM
const requestPushNotificationPermission = async () => {
  try {
    const messagingSupported = await isSupported();
    if (!messagingSupported) {
      console.warn("Firebase Messaging is not supported in this browser.");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const messaging = getMessaging(app);
      const currentToken = await getToken(messaging, { 
        vapidKey: "BGUc_vcRRb0_O8PC51_ZwTuDdyQMJ0txfNmhe1jPjauGBdyeGQizaEl74j2ALJTfEKSoIvRIqRrhrSDuaA9_Sss" 
      });
      if (currentToken) {
        console.log('Firebase FCM Push Token:', currentToken);
        // You could dispatch this to the backend if needed or store locally
        return currentToken;
      } else {
        console.warn('No registration token available. Request permission to generate one.');
      }
    } else {
      console.warn("Notification permission denied");
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
  }
  return null;
};

export { app, auth, googleProvider, appleProvider, requestPushNotificationPermission };
