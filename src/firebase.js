// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBircYt_x1H7xi9LM0uVTz-2iIzikDN9NM",
  authDomain: "rtsgroup-4994f.firebaseapp.com",
  projectId: "rtsgroup-4994f",
  storageBucket: "rtsgroup-4994f.firebasestorage.app",
  messagingSenderId: "355290475157",
  appId: "1:355290475157:web:2ca472cab6b6d39433c99c",
  measurementId: "G-9D4NQB70SX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
export const firestore = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Export analytics for potential future use
export { analytics };

export default app;