import { recaptchaConfig } from './firebase-config.js';

class RecaptchaService {
  constructor() {
    this.isLoaded = false;
    this.isLoading = false;
    this.loadPromise = null;
  }

  // Load reCAPTCHA script dynamically
  async loadRecaptcha() {
    if (this.isLoaded) return Promise.resolve();
    if (this.isLoading) return this.loadPromise;

    if (!recaptchaConfig.enabled) {
      console.log('reCAPTCHA is disabled in configuration');
      return Promise.resolve();
    }

    if (!recaptchaConfig.siteKey || recaptchaConfig.siteKey === 'YOUR_RECAPTCHA_SITE_KEY') {
      console.warn('reCAPTCHA site key not configured. Please set your site key in firebase-config.js');
      return Promise.resolve();
    }

    this.isLoading = true;
    this.loadPromise = new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (window.grecaptcha) {
        this.isLoaded = true;
        this.isLoading = false;
        resolve();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaConfig.siteKey}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        // Wait for grecaptcha to be ready
        window.grecaptcha.ready(() => {
          this.isLoaded = true;
          this.isLoading = false;
          console.log('reCAPTCHA loaded successfully');
          resolve();
        });
      };

      script.onerror = (error) => {
        this.isLoading = false;
        console.error('Failed to load reCAPTCHA script:', error);
        reject(new Error('Failed to load reCAPTCHA'));
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  // Execute reCAPTCHA and get token
  async executeRecaptcha(action) {
    try {
      if (!recaptchaConfig.enabled) {
        console.log('reCAPTCHA is disabled, skipping verification');
        return { success: true, token: null, score: 1.0 };
      }

      if (!recaptchaConfig.siteKey || recaptchaConfig.siteKey === 'YOUR_RECAPTCHA_SITE_KEY') {
        console.warn('reCAPTCHA not configured, skipping verification');
        return { success: true, token: null, score: 1.0 };
      }

      await this.loadRecaptcha();

      if (!window.grecaptcha) {
        throw new Error('reCAPTCHA not available');
      }

      const token = await window.grecaptcha.execute(recaptchaConfig.siteKey, { action });

      return {
        success: true,
        token: token,
        action: action,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('reCAPTCHA execution failed:', error);
      return {
        success: false,
        error: error.message,
        token: null
      };
    }
  }

  // Verify reCAPTCHA token (client-side validation - for UX only)
  // Note: Real verification should be done server-side
  async verifyToken(token, action) {
    if (!recaptchaConfig.enabled || !token) {
      return { success: true, score: 1.0 };
    }

    // Client-side verification is limited and mainly for UX
    // In a real application, you would send the token to your backend
    // for server-side verification using Google's reCAPTCHA API
    
    try {
      // For demo purposes, we'll simulate verification
      // In production, this should be done on your backend:
      /*
      const response = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action })
      });
      const result = await response.json();
      return result;
      */

      // Simulated verification (replace with actual backend call)
      console.log('reCAPTCHA token generated for action:', action);
      
      return {
        success: true,
        score: 0.9, // Simulated score
        action: action,
        hostname: window.location.hostname
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if reCAPTCHA is available and configured
  isAvailable() {
    return recaptchaConfig.enabled && 
           recaptchaConfig.siteKey && 
           recaptchaConfig.siteKey !== 'YOUR_RECAPTCHA_SITE_KEY';
  }

  // Get configuration
  getConfig() {
    return { ...recaptchaConfig };
  }
}

// Create and export singleton instance
export const recaptchaService = new RecaptchaService();

// Export configuration for easy access
export { recaptchaConfig };
