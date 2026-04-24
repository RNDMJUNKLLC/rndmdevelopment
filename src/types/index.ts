// User and Authentication types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  createdAt?: string;
}

// Form submission types
export interface ContactFormSubmission {
  id?: string;
  name: string;
  email: string;
  company?: string;
  projectType: string;
  budget: string;
  timeline: string;
  message: string;
  timestamp: number;
  userId?: string;
  status: 'pending' | 'viewed' | 'responded';
}

export interface SOSSubmission {
  id?: string;
  name: string;
  business: string;
  email: string;
  phone: string;
  project: string;
  projectId: string;
  requestType: string;
  timeline: string;
  priority: string;
  details: string;
  timestamp: number;
}

export interface FormValidationError {
  field: string;
  message: string;
}

// Redux state types
export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

export interface FormsState {
  submissions: ContactFormSubmission[];
  currentSubmission: ContactFormSubmission | null;
  loading: boolean;
  error: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
}

export interface UIState {
  isDarkMode: boolean;
  isMenuOpen: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface RootState {
  auth: AuthState;
  forms: FormsState;
  ui: UIState;
}

// Response types from services
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface reCAPTCHAConfig {
  siteKey: string;
  minimumScore: number;
  enabled: boolean;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}
