import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, off } from 'firebase/database';
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Firebase service for handling contact form submissions
export class FirebaseService {
  constructor() {
    this.contactFormsRef = ref(database, 'contact-forms');
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

  // Stop listening for changes
  offContactFormsChange() {
    off(this.contactFormsRef);
  }
}

// Create and export a singleton instance
export const firebaseService = new FirebaseService();
