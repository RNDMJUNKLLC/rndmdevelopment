import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, off, update, remove } from 'firebase/database';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { firebaseConfig, adminConfig } from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Firebase service for handling contact form submissions and authentication
export class FirebaseService {
  constructor() {
    this.contactFormsRef = ref(database, 'contact-forms');
    this.currentUser = null;
    
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (this.onAuthStateChangedCallback) {
        this.onAuthStateChangedCallback(user);
      }
    });
  }

  // Set up auth state change listener
  onAuthStateChange(callback) {
    this.onAuthStateChangedCallback = callback;
  }

  // Admin authentication methods
  async signInAdmin(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user is in allowed admin emails (if configured)
      if (adminConfig.allowedAdminEmails.length > 0) {
        if (!adminConfig.allowedAdminEmails.includes(user.email)) {
          await this.signOutAdmin();
          return { 
            success: false, 
            message: 'Access denied. You are not authorized as an admin.' 
          };
        }
      }
      
      return { 
        success: true, 
        message: 'Successfully signed in as admin!',
        user: user 
      };
    } catch (error) {
      console.error('Sign in error:', error);
      
      let errorMessage = 'Failed to sign in. Please check your credentials.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
      }
      
      return { success: false, message: errorMessage };
    }
  }

  // Create admin account (for initial setup)
  async createAdminAccount(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      return { 
        success: true, 
        message: 'Admin account created successfully!',
        user: user 
      };
    } catch (error) {
      console.error('Account creation error:', error);
      
      let errorMessage = 'Failed to create account.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
      }
      
      return { success: false, message: errorMessage };
    }
  }

  // Sign out admin
  async signOutAdmin() {
    try {
      await signOut(auth);
      return { success: true, message: 'Successfully signed out.' };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, message: 'Failed to sign out.' };
    }
  }

  // Check if user is currently authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Submit contact form data
  async submitContactForm(formData) {
    try {
      const newFormData = {
        ...formData,
        timestamp: Date.now(),
        dateSubmitted: new Date().toISOString()
      };
      
      await push(this.contactFormsRef, newFormData);
      return { success: true, message: 'Form submitted successfully!' };
    } catch (error) {
      console.error('Error submitting form:', error);
      return { success: false, message: 'Failed to submit form. Please try again.' };
    }
  }

  // Listen for contact form submissions (for admin page)
  onContactFormsChange(callback) {
    onValue(this.contactFormsRef, (snapshot) => {
      const data = snapshot.val();
      const forms = data ? Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })) : [];
      callback(forms);
    });
  }

  // Update contact form submission
  async updateContactSubmission(submissionId, updatedData) {
    try {
      const submissionRef = ref(database, `contact-forms/${submissionId}`);
      const updateData = {
        ...updatedData,
        lastModified: Date.now(),
        lastModifiedDate: new Date().toISOString()
      };
      
      await update(submissionRef, updateData);
      return { success: true, message: 'Submission updated successfully!' };
    } catch (error) {
      console.error('Error updating submission:', error);
      return { success: false, message: 'Failed to update submission. Please try again.' };
    }
  }

  // Delete contact form submission
  async deleteContactSubmission(submissionId) {
    try {
      const submissionRef = ref(database, `contact-forms/${submissionId}`);
      await remove(submissionRef);
      return { success: true, message: 'Submission deleted successfully!' };
    } catch (error) {
      console.error('Error deleting submission:', error);
      return { success: false, message: 'Failed to delete submission. Please try again.' };
    }
  }

  // Stop listening for changes
  offContactFormsChange() {
    off(this.contactFormsRef);
  }
}

// Create and export a singleton instance
export const firebaseService = new FirebaseService();
