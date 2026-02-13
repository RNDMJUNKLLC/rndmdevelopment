import '@testing-library/jest-dom';

// Mock window.scrollTo (not implemented in jsdom)
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
});

// Mock the firebase service module (uses import.meta.env which Jest doesn't support)
jest.mock('@services/firebase', () => ({
  auth: null,
  database: null,
  storage: null,
  app: null,
}));

// Mock hooks that use import.meta.env (not supported in Jest/jsdom)
jest.mock('@hooks/useEmail', () => ({
  useEmail: () => ({
    sendSubmissionEmail: jest.fn(),
    sendCustomEmail: jest.fn(),
    sendAdminNotification: jest.fn(),
    sendConfirmationEmail: jest.fn(),
  }),
  initializeEmailJS: jest.fn(),
}));

jest.mock('@hooks/useRecaptcha', () => ({
  useRecaptcha: () => ({
    config: { siteKey: '', minimumScore: 0.5, enabled: false },
    executeRecaptcha: jest.fn(),
    verifyToken: jest.fn(),
    isScoreValid: jest.fn(() => true),
    isConfigured: jest.fn(() => false),
  }),
  default: jest.fn(),
}));

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(),
  ref: jest.fn(),
  push: jest.fn(),
  set: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  onValue: jest.fn(),
  query: jest.fn(),
  orderByChild: jest.fn(),
  equalTo: jest.fn(),
  limitToLast: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
}));

// Mock EmailJS
jest.mock('@emailjs/browser', () => ({
  init: jest.fn(),
  send: jest.fn(),
}));

// Mock window.grecaptcha
declare global {
  var grecaptcha: {
    ready: jest.Mock;
    execute: jest.Mock;
    render: jest.Mock;
  };
}

(global as any).grecaptcha = {
  ready: jest.fn((callback: () => void) => callback()),
  execute: jest.fn(),
  render: jest.fn(),
};

// Mock environment variables
process.env.VITE_FIREBASE_PROJECT_ID = 'test-project';
process.env.VITE_RECAPTCHA_SITE_KEY = 'test-site-key';
process.env.VITE_EMAILJS_SERVICE_ID = 'test-service-id';
process.env.VITE_EMAILJS_TEMPLATE_ID = 'test-template-id';
process.env.VITE_EMAILJS_PUBLIC_KEY = 'test-public-key';
