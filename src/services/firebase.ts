import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import type { FirebaseConfig } from '@/types';

/**
 * Firebase configuration from environment variables
 */
const getFirebaseConfig = (): FirebaseConfig => {
  const config: FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  // Validate that all required config values are present
  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  const missingFields = requiredFields.filter((field) => !config[field as keyof FirebaseConfig]);
  
  if (missingFields.length > 0) {
    console.warn(
      `Missing Firebase configuration: ${missingFields.join(', ')}. ` +
      'Please add these to your .env.local file'
    );
  }

  return config;
};

// Initialize Firebase app
const firebaseConfig = getFirebaseConfig();
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth: Auth = getAuth(app);
export const database: Database = getDatabase(app);
export const storage: FirebaseStorage = getStorage(app);

/**
 * Check if Firebase is properly configured
 */
export const isFirebaseConfigured = (): boolean => {
  const config = getFirebaseConfig();
  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  return requiredFields.every((field) => config[field as keyof FirebaseConfig]);
};

/**
 * Initialize Firebase (called once at app startup)
 */
export const initializeFirebase = (): void => {
  if (!isFirebaseConfigured()) {
    console.error(
      'Firebase is not properly configured. ' +
      'Please check your environment variables in .env.local'
    );
    return;
  }
};

export default app;
