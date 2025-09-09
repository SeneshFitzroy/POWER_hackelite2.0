import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Log environment variables for debugging (remove in production)

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Check if Firebase config values are present
const isFirebaseConfigValid = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.apiKey !== '' && 
         firebaseConfig.apiKey !== 'undefined' &&
         firebaseConfig.projectId && 
         firebaseConfig.projectId !== '' && 
         firebaseConfig.projectId !== 'undefined';
};

let app, db, auth;

if (isFirebaseConfigValid()) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.warn('Firebase configuration is invalid or missing environment variables');
  console.log('Current config:', firebaseConfig);
}

export { db, auth };
export default app;