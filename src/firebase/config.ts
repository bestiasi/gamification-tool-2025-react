import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Local tests run against the emulators under a demo- project, which can never reach production.
const useEmulators = import.meta.env.VITE_FIREBASE_EMULATORS === 'true';

const firebaseConfig = {
  apiKey: "AIzaSyBngPC5zbf4oU4s8IxJQ7a40r6U4xopHiM",
  authDomain: "s2ws2w.firebaseapp.com",
  projectId: useEmulators ? "demo-gt-2025" : "s2ws2w",
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

if (useEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

export default app;
