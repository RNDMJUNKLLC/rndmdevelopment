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

// Initialize Firebase app (only if configured)
const firebaseConfig = getFirebaseConfig();
const requiredFields = ['apiKey', 'authDomain', 'projectId'];
const hasRequiredConfig = requiredFields.every(
  (field) => !!firebaseConfig[field as keyof FirebaseConfig]
);

let app: ReturnType<typeof initializeApp> | null = null;
let auth: Auth | null = null;
let database: Database | null = null;
let storage: FirebaseStorage | null = null;

if (hasRequiredConfig) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  database = getDatabase(app);
  storage = getStorage(app);
} else {
  console.warn(
    'Firebase is not configured. Set VITE_FIREBASE_* environment variables to enable Firebase features.'
  );
}

export { auth, database, storage };

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
