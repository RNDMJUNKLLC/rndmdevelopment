import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, off, update, remove, get } from 'firebase/database';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail 
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
    this.usersRef = ref(database, 'users');
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

  // Regular user authentication methods
  async signInUser(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      return { 
        success: true, 
        message: 'Successfully signed in!',
        user: user 
      };
    } catch (error) {
      console.error('User sign in error:', error);
      
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

  // Register new user
  async registerUser(userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const user = userCredential.user;
      
      // Update user profile with display name
      await updateProfile(user, {
        displayName: `${userData.firstName} ${userData.lastName}`
      });
      
      // Save additional user data to database
      const userProfileData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        company: userData.company || '',
        email: userData.email,
        displayName: `${userData.firstName} ${userData.lastName}`,
        marketingEmails: userData.marketingEmails || false,
        createdAt: Date.now(),
        createdDate: new Date().toISOString()
      };
      
      const userRef = ref(database, `users/${user.uid}`);
      await update(userRef, userProfileData);
      
      return { 
        success: true, 
        message: 'Account created successfully!',
        user: user 
      };
    } catch (error) {
      console.error('User registration error:', error);
      
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

  // Update user profile
  async updateUserProfile(profileData) {
    try {
      console.log('Firebase: updateUserProfile called with:', profileData);
      
      const user = auth.currentUser;
      if (!user) {
        console.error('Firebase: No user is currently signed in');
        return { success: false, message: 'No user is currently signed in.' };
      }
      
      console.log('Firebase: Current user UID:', user.uid);
      
      // Validate required fields
      if (!profileData.editFirstName || !profileData.editLastName) {
        console.error('Firebase: Missing required fields');
        return { success: false, message: 'First name and last name are required.' };
      }
      
      // Update Firebase Auth profile first
      try {
        await updateProfile(user, {
          displayName: `${profileData.editFirstName} ${profileData.editLastName}`
        });
        console.log('Firebase: Auth profile updated successfully');
      } catch (authError) {
        console.error('Firebase: Error updating auth profile:', authError);
        // Continue with database update even if auth profile update fails
      }
      
      // Update user data in database
      const userRef = ref(database, `users/${user.uid}`);
      const updateData = {
        firstName: profileData.editFirstName,
        lastName: profileData.editLastName,
        company: profileData.editUserCompany || '',
        phone: profileData.editPhone || '',
        displayName: `${profileData.editFirstName} ${profileData.editLastName}`,
        lastModified: Date.now(),
        lastModifiedDate: new Date().toISOString()
      };
      
      console.log('Firebase: Updating database with:', updateData);
      console.log('Firebase: Database path:', `users/${user.uid}`);
      
      await update(userRef, updateData);
      console.log('Firebase: Database updated successfully');
      
      return { 
        success: true, 
        message: 'Profile updated successfully!' 
      };
    } catch (error) {
      console.error('Firebase: Profile update error:', error);
      console.error('Firebase: Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to update profile. Please try again.';
      
      // Handle specific Firebase errors
      if (error.code) {
        switch (error.code) {
          case 'auth/requires-recent-login':
            errorMessage = 'Please sign out and sign back in, then try updating your profile.';
            break;
          case 'permission-denied':
            errorMessage = 'You do not have permission to update this profile.';
            break;
          case 'network-request-failed':
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
          default:
            errorMessage = `Update failed: ${error.message}`;
        }
      }
      
      return { success: false, message: errorMessage };
    }
  }

  // Get user profile data
  async getUserProfile(userId = null) {
    try {
      const uid = userId || auth.currentUser?.uid;
      if (!uid) {
        return { success: false, message: 'No user ID provided.' };
      }
      
      const userRef = ref(database, `users/${uid}`);
      
      return new Promise((resolve) => {
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            resolve({ 
              success: true, 
              profile: snapshot.val() 
            });
          } else {
            resolve({ 
              success: false, 
              message: 'User profile not found.' 
            });
          }
        }, {
          onlyOnce: true
        });
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, message: 'Failed to retrieve profile.' };
    }
  }

  // Send password reset email
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { 
        success: true, 
        message: 'Password reset email sent!' 
      };
    } catch (error) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Failed to send reset email.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
      }
      
      return { success: false, message: errorMessage };
    }
  }

  // Sign out user
  async signOutUser() {
    try {
      await signOut(auth);
      return { success: true, message: 'Successfully signed out.' };
    } catch (error) {
      console.error('User sign out error:', error);
      return { success: false, message: 'Failed to sign out.' };
    }
  }

  // Get user's project submissions
  async getUserSubmissions(userId) {
    try {
      const snapshot = await get(this.contactFormsRef);
      if (snapshot.exists()) {
        const allSubmissions = snapshot.val();
        const userSubmissions = [];
        
        Object.keys(allSubmissions).forEach(key => {
          const submission = allSubmissions[key];
          if (submission.userId === userId || submission.submittedBy === userId) {
            userSubmissions.push({
              id: key,
              ...submission
            });
          }
        });
        
        // Sort by timestamp (newest first)
        return userSubmissions.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      }
      return [];
    } catch (error) {
      console.error('Error getting user submissions:', error);
      return [];
    }
  }

  // Listen to user's submissions in real-time
  onUserSubmissionsChange(userId, callback) {
    const unsubscribe = onValue(this.contactFormsRef, (snapshot) => {
      if (snapshot.exists()) {
        const allSubmissions = snapshot.val();
        const userSubmissions = [];
        
        Object.keys(allSubmissions).forEach(key => {
          const submission = allSubmissions[key];
          if (submission.userId === userId || submission.submittedBy === userId) {
            userSubmissions.push({
              id: key,
              ...submission
            });
          }
        });
        
        // Sort by timestamp (newest first)
        const sortedSubmissions = userSubmissions.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        callback(sortedSubmissions);
      } else {
        callback([]);
      }
    });
    
    return unsubscribe;
  }
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

  // Submit support ticket
  async submitSupportTicket(supportData) {
    try {
      const supportTicketsRef = ref(database, 'support-tickets');
      const newTicketData = {
        ...supportData,
        timestamp: Date.now(),
        dateSubmitted: new Date().toISOString(),
        ticketId: `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
      };
      
      await push(supportTicketsRef, newTicketData);
      return { success: true, message: 'Support ticket submitted successfully!' };
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      return { success: false, message: 'Failed to submit support ticket. Please try again.' };
    }
  }

  // Submit career application
  async submitApplication(applicationData) {
    try {
      const applicationsRef = ref(database, 'applications');
      const newApplicationData = {
        ...applicationData,
        timestamp: Date.now(),
        dateSubmitted: new Date().toISOString(),
        applicationId: `APP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
      };
      
      await push(applicationsRef, newApplicationData);
      return { success: true, message: 'Application submitted successfully!' };
    } catch (error) {
      console.error('Error submitting application:', error);
      return { success: false, message: 'Failed to submit application. Please try again.' };
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

  // Get all submissions (for admin dashboard)
  async getAllSubmissions() {
    try {
      const snapshot = await get(this.contactFormsRef);
      if (snapshot.exists()) {
        const submissions = [];
        snapshot.forEach((childSnapshot) => {
          submissions.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        return { success: true, submissions: submissions };
      }
      return { success: true, submissions: [] };
    } catch (error) {
      console.error('Error getting all submissions:', error);
      return { success: false, message: error.message, submissions: [] };
    }
  }

  // Get all users (for admin dashboard)
  async getAllUsers() {
    try {
      const snapshot = await get(ref(database, 'users'));
      if (snapshot.exists()) {
        const users = [];
        snapshot.forEach((childSnapshot) => {
          users.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        return { success: true, users: users };
      }
      return { success: true, users: [] };
    } catch (error) {
      console.error('Error getting all users:', error);
      return { success: false, message: error.message, users: [] };
    }
  }

  // Get all support tickets (for admin dashboard)
  async getAllSupportTickets() {
    try {
      const supportTicketsRef = ref(database, 'support-tickets');
      const snapshot = await get(supportTicketsRef);
      if (snapshot.exists()) {
        const tickets = [];
        snapshot.forEach((childSnapshot) => {
          tickets.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        return { success: true, tickets: tickets };
      }
      return { success: true, tickets: [] };
    } catch (error) {
      console.error('Error getting all support tickets:', error);
      return { success: false, message: error.message, tickets: [] };
    }
  }

  // Update support ticket
  async updateSupportTicket(ticketId, updatedData) {
    try {
      const ticketRef = ref(database, `support-tickets/${ticketId}`);
      const updateData = {
        ...updatedData,
        lastModified: Date.now(),
        lastModifiedDate: new Date().toISOString()
      };
      
      await update(ticketRef, updateData);
      return { success: true, message: 'Support ticket updated successfully!' };
    } catch (error) {
      console.error('Error updating support ticket:', error);
      return { success: false, message: 'Failed to update support ticket. Please try again.' };
    }
  }

  // Delete support ticket
  async deleteSupportTicket(ticketId) {
    try {
      const ticketRef = ref(database, `support-tickets/${ticketId}`);
      await remove(ticketRef);
      return { success: true, message: 'Support ticket deleted successfully!' };
    } catch (error) {
      console.error('Error deleting support ticket:', error);
      return { success: false, message: 'Failed to delete support ticket. Please try again.' };
    }
  }

  // Career Applications Management
  async getCareerApplications() {
    try {
      const applicationsRef = ref(database, 'applications');
      const snapshot = await get(applicationsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const applications = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }))
        // Filter only career applications
        .filter(app => app.type === 'career_application');
        
        // Sort by timestamp, newest first
        applications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return { success: true, applications };
      } else {
        return { success: true, applications: [] };
      }
    } catch (error) {
      console.error('Error fetching career applications:', error);
      return { success: false, error: error.message, applications: [] };
    }
  }

  async updateApplicationStatus(applicationId, status) {
    try {
      const applicationRef = ref(database, `applications/${applicationId}`);
      await update(applicationRef, { 
        status: status,
        lastUpdated: new Date().toISOString()
      });
      return { success: true, message: 'Application status updated successfully!' };
    } catch (error) {
      console.error('Error updating application status:', error);
      return { success: false, message: 'Failed to update application status. Please try again.' };
    }
  }

  async deleteApplication(applicationId) {
    try {
      const applicationRef = ref(database, `applications/${applicationId}`);
      await remove(applicationRef);
      return { success: true, message: 'Application deleted successfully!' };
    } catch (error) {
      console.error('Error deleting application:', error);
      return { success: false, message: 'Failed to delete application. Please try again.' };
    }
  }

  // Stop listening for changes
  offContactFormsChange() {
    off(this.contactFormsRef);
  }
}

// Create and export a singleton instance
export const firebaseService = new FirebaseService();
