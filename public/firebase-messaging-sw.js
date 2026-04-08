importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyC6LrtTPhE8q_ACFVW_mGzwXM_RhRqq0d0",
  authDomain: "frame-the-world.firebaseapp.com",
  projectId: "frame-the-world",
  storageBucket: "frame-the-world.firebasestorage.app",
  messagingSenderId: "78552630056",
  appId: "1:78552630056:web:1bc096b534255ab7d0c61d",
  measurementId: "G-E3KNH0WZB7"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/images/logo.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
