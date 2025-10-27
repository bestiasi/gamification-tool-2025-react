import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// TODO: Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBngPC5zbf4oU4s8IxJQ7a40r6U4xopHiM",
  authDomain: "s2ws2w.firebaseapp.com",
  projectId: "s2ws2w",
  storageBucket: "s2ws2w.firebasestorage.app",
  messagingSenderId: "1099336807116",
  appId: "1:1099336807116:web:b656b085059f8d47fe8869",
  measurementId: "G-FPTLH2F1T5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

export default app;
