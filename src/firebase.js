import { initializeApp } from 'firebase/app';
import { isSupported, getAnalytics } from 'firebase/analytics';

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

// Analytics relies on IndexedDB/fetch that old Android WebViews may lack;
// isSupported() avoids crashing the whole app on those devices.
isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
});
