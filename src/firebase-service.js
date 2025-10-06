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
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { firebaseConfig } from './firebase-config.js';
import { recaptchaService } from './recaptcha-service.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

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

  // Create admin account (for initial setup)

  // Sign out admin

  // Check if user is currently authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Submit contact form data with reCAPTCHA verification
  async submitContactForm(formData) {
    try {
      // Execute reCAPTCHA verification
      const recaptchaResult = await recaptchaService.executeRecaptcha('contact_form');
      if (!recaptchaResult.success) {
        console.warn('reCAPTCHA verification failed:', recaptchaResult.error);
        return { success: false, message: 'Security verification failed. Please try again.' };
      }

      const newFormData = {
        ...formData,
        timestamp: Date.now(),
        dateSubmitted: new Date().toISOString(),
        recaptchaToken: recaptchaResult.token,
        recaptchaAction: recaptchaResult.action
      };
      
      await push(this.contactFormsRef, newFormData);
      return { success: true, message: 'Form submitted successfully!' };
    } catch (error) {
      console.error('Error submitting form:', error);
      return { success: false, message: 'Failed to submit form. Please try again.' };
    }
  }

  // Submit support ticket with reCAPTCHA verification
  async submitSupportTicket(supportData) {
    try {
      // Validate required fields
      if (!supportData.userEmail) {
        console.error('Missing userEmail in support data:', supportData);
        return { success: false, message: 'User email is required to submit a support ticket.' };
      }
      
      // Execute reCAPTCHA verification
      const recaptchaResult = await recaptchaService.executeRecaptcha('support_ticket');
      if (!recaptchaResult.success) {
        console.warn('reCAPTCHA verification failed:', recaptchaResult.error);
        return { success: false, message: 'Security verification failed. Please try again.' };
      }

      const supportTicketsRef = ref(database, 'support-tickets');
      const newTicketData = {
        ...supportData,
        timestamp: Date.now(),
        dateSubmitted: new Date().toISOString(),
        ticketId: `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        recaptchaToken: recaptchaResult.token,
        recaptchaAction: recaptchaResult.action
      };
      
      await push(supportTicketsRef, newTicketData);
      return { success: true, message: 'Support ticket submitted successfully!' };
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      return { success: false, message: 'Failed to submit support ticket. Please try again.' };
    }
  }

  // Submit career application with resume upload and reCAPTCHA verification
  async submitApplication(applicationData, resumeFile = null) {
    try {
      // Execute reCAPTCHA verification
      const recaptchaResult = await recaptchaService.executeRecaptcha('career_application');
      if (!recaptchaResult.success) {
        console.warn('reCAPTCHA verification failed:', recaptchaResult.error);
        return { success: false, message: 'Security verification failed. Please try again.' };
      }

      let resumeInfo = {};
      
      // Handle resume file upload if provided
      if (resumeFile) {
        try {
          const resumeUploadResult = await this.uploadResume(resumeFile, applicationData.email);
          resumeInfo = {
            resumeFileName: resumeFile.name,
            resumeSize: resumeFile.size,
            resumeUrl: resumeUploadResult.downloadURL,
            resumeStoragePath: resumeUploadResult.storagePath
          };
        } catch (uploadError) {
          console.error('Error uploading resume:', uploadError);
          return { success: false, message: 'Failed to upload resume. Please try again.' };
        }
      }
      
      const applicationsRef = ref(database, 'applications');
      const newApplicationData = {
        ...applicationData,
        ...resumeInfo,
        timestamp: Date.now(),
        dateSubmitted: new Date().toISOString(),
        applicationId: `APP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        recaptchaToken: recaptchaResult.token,
        recaptchaAction: recaptchaResult.action
      };
      
      await push(applicationsRef, newApplicationData);
      return { success: true, message: 'Application submitted successfully!' };
    } catch (error) {
      console.error('Error submitting application:', error);
      return { success: false, message: 'Failed to submit application. Please try again.' };
    }
  }

  // Firebase Storage methods for resume handling
  async uploadResume(file, userEmail) {
    try {
      // Create a unique filename to avoid conflicts
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const sanitizedEmail = userEmail.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `resume_${sanitizedEmail}_${timestamp}.${fileExtension}`;
      
      // Create storage reference
      const resumeStorageRef = storageRef(storage, `resumes/${fileName}`);
      
      // Upload file
      const snapshot = await uploadBytes(resumeStorageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        success: true,
        downloadURL: downloadURL,
        storagePath: `resumes/${fileName}`,
        fileName: fileName
      };
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw new Error('Failed to upload resume file');
    }
  }

  async getResumeDownloadUrl(storagePath) {
    try {
      const resumeRef = storageRef(storage, storagePath);
      const downloadURL = await getDownloadURL(resumeRef);
      return { success: true, downloadURL };
    } catch (error) {
      console.error('Error getting resume download URL:', error);
      return { success: false, message: 'Failed to get resume download link' };
    }
  }

  async deleteResume(storagePath) {
    try {
      const resumeRef = storageRef(storage, storagePath);
      await deleteObject(resumeRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting resume:', error);
      return { success: false, message: 'Failed to delete resume file' };
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
      // First, get the application data to check if there's a resume to delete
      const applicationRef = ref(database, `applications/${applicationId}`);
      const snapshot = await get(applicationRef);
      
      if (snapshot.exists()) {
        const applicationData = snapshot.val();
        
        // If there's a resume stored, delete it from Storage first
        if (applicationData.resumeStoragePath) {
          try {
            await this.deleteResume(applicationData.resumeStoragePath);
          } catch (storageError) {
            console.warn('Could not delete resume file from storage:', storageError);
            // Continue with application deletion even if resume deletion fails
          }
        }
      }
      
      // Delete the application from database
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

  // Simplified sign up method for new user flow
  async signUp(email, password, profile) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update auth profile with display name
      await updateProfile(user, {
        displayName: profile.name
      });
      
      // Save simplified user profile to database
      const userProfileData = {
        name: profile.name,
        businessName: profile.businessName,
        email: email,
        phone: profile.phone || '',
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
      console.error('Sign up error:', error);
      
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

  // Simplified sign in method
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        message: 'Signed in successfully!',
        user: userCredential.user
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
      }
      
      return { success: false, message: errorMessage };
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        return {
          success: true,
          profile: snapshot.val()
        };
      } else {
        return {
          success: false,
          message: 'Profile not found'
        };
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      return {
        success: false,
        message: 'Failed to load profile'
      };
    }
  }

  // Get user's submissions
  async getUserSubmissions(userId) {
    try {
      const submissionsRef = ref(database, 'contact-forms');
      const snapshot = await get(submissionsRef);
      
      if (snapshot.exists()) {
        const allSubmissions = [];
        snapshot.forEach((childSnapshot) => {
          const submission = childSnapshot.val();
          if (submission.userId === userId) {
            allSubmissions.push({
              id: childSnapshot.key,
              ...submission
            });
          }
        });
        
        // Sort by timestamp, newest first
        allSubmissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return {
          success: true,
          submissions: allSubmissions
        };
      } else {
        return {
          success: true,
          submissions: []
        };
      }
    } catch (error) {
      console.error('Error getting user submissions:', error);
      return {
        success: false,
        message: 'Failed to load projects',
        submissions: []
      };
    }
  }

  // Save submission (inquiry)
  async saveSubmission(data) {
    try {
      const newSubmissionRef = push(this.contactFormsRef);
      await update(newSubmissionRef, data);
      
      return {
        success: true,
        message: 'Submission saved successfully',
        id: newSubmissionRef.key
      };
    } catch (error) {
      console.error('Error saving submission:', error);
      return {
        success: false,
        message: 'Failed to save submission'
      };
    }
  }
}

// Create and export a singleton instance
export const firebaseService = new FirebaseService();
