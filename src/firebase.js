import { initializeApp } from 'firebase/app';
import { isSupported, getAnalytics } from 'firebase/analytics';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCD-GRWCyu3J5EL4ew4aiSsd4dBiAFxdLg',
  authDomain: 'q2-reports.firebaseapp.com',
  projectId: 'q2-reports',
  storageBucket: 'q2-reports.firebasestorage.app',
  messagingSenderId: '293645344824',
  appId: '1:293645344824:web:348dd9b534852575f206cd',
  measurementId: 'G-9ECJZCXLXW',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Lets local dev point at `firebase emulators:start` instead of live data,
// without touching production behavior (the env var defaults to unset).
if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
}

// Analytics relies on IndexedDB/fetch that old Android WebViews may lack;
// isSupported() avoids crashing the whole app on those devices.
isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
});
