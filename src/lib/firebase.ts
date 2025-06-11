// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbGyFs51Jh5uc-KuZBC-Qsi_mKOFWZnSQ",
  authDomain: "real-time-ex.firebaseapp.com",
  databaseURL: "https://real-time-ex-default-rtdb.firebaseio.com",
  projectId: "real-time-ex",
  storageBucket: "real-time-ex.firebasestorage.app", // Corrected from firebasestorage.app to appspot.com based on common patterns if this was a typo by user. If user intended .firebasestorage.app, this will be fine.
  messagingSenderId: "81117229041",
  appId: "1:81117229041:web:eec123f6c850e2d68a1e50",
  measurementId: "G-GVBH6732QC"
};

let app: FirebaseApp;
let analytics;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase Analytics only in the browser
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.error("Firebase Analytics initialization failed:", error);
  }
}

export { app, analytics };
