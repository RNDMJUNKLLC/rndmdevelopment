#!/bin/bash

# Script to remove admin functionality from main.js

cd /workspaces/rndmdevelopment/src

# Create a new cleaned version
cat > main_clean.js << 'EOF'
import './style.css';
import { firebaseService } from './firebase-service.js';
import { emailService } from './email-service.js';
import { recaptchaService } from './recaptcha-service.js';

// Application state
const appState = {
  currentPage: 'home',
  currentUser: null,
  isUserLoggedIn: false,
  userProfile: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  renderNavigation();
  renderCurrentPage();
  attachEventListeners();
  
  // Initialize reCAPTCHA
  initializeRecaptcha();
  
  // Set up Firebase Auth state listener
  firebaseService.onAuthStateChange(async (user) => {
    const wasUserLoggedIn = appState.isUserLoggedIn;
    
    appState.isUserLoggedIn = !!user;
    appState.currentUser = user;
    
    // Load user profile if user is logged in
    if (user && appState.isUserLoggedIn) {
      try {
        const profileResult = await firebaseService.getUserProfile(user.uid);
        if (profileResult.success) {
          appState.userProfile = profileResult.profile;
        } else {
          // Create basic profile from user info
          appState.userProfile = {
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ')[1] || '',
            displayName: user.displayName || '',
            email: user.email
          };
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    } else if (!user) {
      appState.userProfile = null;
    }
    
    // Re-render if we're on the account page and auth state changed
    if (appState.currentPage === 'account' && wasUserLoggedIn !== appState.isUserLoggedIn) {
      renderCurrentPage();
    }
  });
}
EOF

# Extract non-admin functions from the original file
echo "" >> main_clean.js

# Extract navigation function
sed -n '69,101p' main.js >> main_clean.js

# Extract attachHamburgerMenu function
sed -n '102,170p' main.js >> main_clean.js

# Extract renderCurrentPage function but modify it to remove admin case
sed -n '171,208p' main.js | sed '/case.*admin/,/break;/d' >> main_clean.js

# Extract all page render functions except admin
sed -n '209,1260p' main.js >> main_clean.js

# Extract renderAccountPage
sed -n '1261,1665p' main.js >> main_clean.js

# Add empty admin page function
cat >> main_clean.js << 'EOF'

// Admin functionality removed - redirect to home
function renderAdminPage() {
  navigateToPage('home');
  return renderHomePage();
}
EOF

# Extract attachEventListeners and attachFooterListeners only
sed -n '2128,2151p' main.js >> main_clean.js
sed -n '2152,2157p' main.js >> main_clean.js

# Extract the rest of the file but skip admin functions
sed -n '3958,$p' main.js | grep -v "admin\|Admin\|switchAdminTab\|loadWelcomeContent\|loadAdminData\|enhanceAdminTabsForMobile\|attachAdminLoginListener" >> main_clean.js

# Replace the original with the cleaned version
mv main_clean.js main.js

echo "Admin functionality removed from main.js"
