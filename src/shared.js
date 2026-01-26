// Shared components and utilities for all pages
import { firebaseService } from './firebase-service.js';

// Current page tracking
let currentUser = null;
let currentPage = '';

/**
 * Initialize the page
 * @param {string} pageName - Name of the current page (home, about, services, contact)
 */
export function initializePage(pageName) {
  currentPage = pageName;
  renderNavigation();
  initializeDarkMode();
  createFloatingElements();
  
  // Set up Firebase Auth state listener
  firebaseService.onAuthStateChange((user) => {
    currentUser = user;
    updateAuthButton();
  });
}

/**
 * Render the navigation bar
 */
function renderNavigation() {
  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.innerHTML = `
    <div class="nav-container">
      <a href="index.html" class="logo">RNDM DEVS</a>
      
      <!-- Hamburger Menu Button -->
      <button class="hamburger" id="hamburgerBtn" aria-label="Toggle navigation menu">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
      
      <!-- Navigation Links -->
      <ul class="nav-links" id="navLinks">
        <li><a href="index.html" class="${currentPage === 'home' ? 'active' : ''}">Home</a></li>
        <li><a href="about.html" class="${currentPage === 'about' ? 'active' : ''}">About</a></li>
        <li><a href="services.html" class="${currentPage === 'services' ? 'active' : ''}">Services</a></li>
        <li><a href="token.html" class="${currentPage === 'token' ? 'active' : ''}">$rndmdev</a></li>
        <li><a href="contact.html" class="${currentPage === 'contact' ? 'active' : ''}">Contact</a></li>
        <li><button id="authButton" class="btn-auth">Sign In</button></li>
      </ul>
    </div>
  `;
  
  document.body.insertAdjacentElement('afterbegin', nav);
  attachHamburgerMenu();
  attachAuthButtonListener();
}

/**
 * Update auth button based on user state
 */
function updateAuthButton() {
  const authButton = document.getElementById('authButton');
  if (!authButton) return;
  
  if (currentUser) {
    authButton.textContent = 'Sign Out';
    authButton.onclick = handleSignOut;
  } else {
    authButton.textContent = 'Sign In';
    authButton.onclick = () => {
      window.location.href = 'contact.html';
    };
  }
}

/**
 * Attach auth button listener
 */
function attachAuthButtonListener() {
  updateAuthButton();
}

/**
 * Handle sign out
 */
async function handleSignOut() {
  try {
    const result = await firebaseService.signOut();
    
    if (result.success) {
      // Clear current user
      currentUser = null;
      
      // Clear any cached data
      sessionStorage.clear();
      
      // Show success message
      showNotification('Signed out successfully', 'success');
      
      // Wait a moment for the notification to show
      setTimeout(() => {
        // Redirect to home and force reload to clear all state
        if (currentPage === 'contact') {
          window.location.replace('index.html');
        } else {
          // Reload current page to show signed-out state
          window.location.reload();
        }
      }, 500);
    } else {
      showNotification(result.message, 'error');
    }
  } catch (error) {
    console.error('Sign out error:', error);
    showNotification('Error signing out. Please try again.', 'error');
  }
}

/**
 * Hamburger menu functionality
 */
function attachHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');
  const nav = document.querySelector('.nav');
  
  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', () => {
      const isActive = hamburgerBtn.classList.contains('active');
      
      hamburgerBtn.classList.toggle('active');
      navLinks.classList.toggle('active');
      nav.classList.toggle('menu-open');
      
      if (!isActive) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      
      hamburgerBtn.setAttribute('aria-expanded', !isActive);
    });
    
    // Close menu when clicking on nav links
    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        closeHamburgerMenu();
      }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && navLinks.classList.contains('active')) {
        closeHamburgerMenu();
      }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        closeHamburgerMenu();
      }
    });
    
    function closeHamburgerMenu() {
      hamburgerBtn.classList.remove('active');
      navLinks.classList.remove('active');
      nav.classList.remove('menu-open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    
    // Close menu when resizing to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
        closeHamburgerMenu();
      }
    });
  }
}

/**
 * Render the footer
 */
export function renderFooter() {
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>RNDM DEVS</h3>
            <p>Professional yet fun random website development</p>
          </div>
          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="index.html">Home</a></li>
              <li><a href="about.html">About</a></li>
              <li><a href="services.html">Services</a></li>
              <li><a href="token.html">$rndmdev Token</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="/public/privacy-policy.html">Privacy Policy</a></li>
              <li><a href="/public/terms-of-service.html">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; ${new Date().getFullYear()} RNDM Development. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `;
}

/**
 * Initialize dark mode functionality
 */
function initializeDarkMode() {
  // Check for saved theme preference or default to 'dark'
  const currentTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
}

/**
 * Create floating background elements
 */
function createFloatingElements() {
  const existingContainer = document.querySelector('.floating-elements');
  if (existingContainer) return; // Already created
  
  const container = document.createElement('div');
  container.className = 'floating-elements';
  
  for (let i = 0; i < 20; i++) {
    const element = document.createElement('div');
    element.className = 'floating-element';
    element.style.left = `${Math.random() * 100}%`;
    element.style.animationDelay = `${Math.random() * 10}s`;
    element.style.animationDuration = `${10 + Math.random() * 20}s`;
    container.appendChild(element);
  }
  
  document.body.appendChild(container);
}

/**
 * Show notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, info)
 */
export function showNotification(message, type = 'info') {
  // Remove existing notification
  const existing = document.querySelector('.notification');
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Remove after 5 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

/**
 * Get current user
 * @returns {Object|null} Current Firebase user or null
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is logged in
 */
export function isAuthenticated() {
  return currentUser !== null;
}
