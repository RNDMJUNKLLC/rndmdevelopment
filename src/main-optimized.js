// Lazy loading for better performance
const lazyLoadModules = {
  firebase: () => import('./firebase-service.js'),
  email: () => import('./email-service.js'),
  config: () => import('./firebase-config.js')
};

// Application state
const appState = {
  currentPage: 'home',
  isAdminLoggedIn: false,
  currentUser: null,
  isUserLoggedIn: false,
  userProfile: null,
  modulesLoaded: {}
};

// Performance optimization: Use requestIdleCallback for non-critical tasks
const scheduleWork = (callback) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 2000 });
  } else {
    setTimeout(callback, 1);
  }
};

// Initialize the application with performance optimizations
document.addEventListener('DOMContentLoaded', () => {
  // Critical path: render immediately
  renderNavigation();
  renderCurrentPage();
  attachEventListeners();
  
  // Non-critical: defer these operations
  scheduleWork(() => {
    initializeDarkMode();
    createFloatingElements();
  });
  
  // Load modules only when needed
  loadModulesOnDemand();
});

// Lazy load modules only when needed
async function loadModulesOnDemand() {
  // Check if we need Firebase or Email services immediately
  const currentHash = window.location.hash;
  const needsAuth = ['#admin', '#account'].includes(currentHash);
  const needsEmail = ['#contact'].includes(currentHash);
  
  if (needsAuth && !appState.modulesLoaded.firebase) {
    await loadFirebaseService();
  }
  
  if (needsEmail && !appState.modulesLoaded.email) {
    await loadEmailService();
  }
}

async function loadFirebaseService() {
  if (!appState.modulesLoaded.firebase) {
    try {
      const [{ firebaseService }, { adminConfig }] = await Promise.all([
        lazyLoadModules.firebase(),
        lazyLoadModules.config()
      ]);
      
      // Set up Firebase Auth state listener
      firebaseService.onAuthStateChange(handleAuthStateChange);
      appState.modulesLoaded.firebase = { firebaseService, adminConfig };
    } catch (error) {
      console.error('Failed to load Firebase service:', error);
    }
  }
  return appState.modulesLoaded.firebase;
}

async function loadEmailService() {
  if (!appState.modulesLoaded.email) {
    try {
      const { emailService } = await lazyLoadModules.email();
      appState.modulesLoaded.email = { emailService };
      
      // Initialize EmailJS when email service is loaded
      scheduleWork(() => initializeEmailJS());
    } catch (error) {
      console.error('Failed to load Email service:', error);
    }
  }
  return appState.modulesLoaded.email;
}

// Optimized auth state handler
async function handleAuthStateChange(user) {
  const wasAdminLoggedIn = appState.isAdminLoggedIn;
  const wasUserLoggedIn = appState.isUserLoggedIn;
  
  if (!appState.modulesLoaded.firebase) return;
  
  const { adminConfig, firebaseService } = appState.modulesLoaded.firebase;
  
  // Check if user is admin
  const isAdmin = !!user && (
    adminConfig.allowedAdminEmails.length === 0 || 
    adminConfig.allowedAdminEmails.includes(user.email)
  );
  
  appState.isAdminLoggedIn = isAdmin;
  appState.isUserLoggedIn = !!user && !isAdmin;
  appState.currentUser = user;
  
  // Load user profile if user is logged in (but not admin)
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
  
  // Re-render if we're on the admin or account page and auth state changed
  if ((appState.currentPage === 'admin' && wasAdminLoggedIn !== appState.isAdminLoggedIn) ||
      (appState.currentPage === 'account' && wasUserLoggedIn !== appState.isUserLoggedIn)) {
    renderCurrentPage();
  }
}

// Navigation rendering with performance optimizations
function renderNavigation() {
  const navigation = `
    <nav class="nav" role="navigation" aria-label="Main navigation">
      <div class="nav-container">
        <a href="#" class="logo" data-page="home" aria-label="RNDM DEVS - Home">RNDM DEVS</a>
        
        <!-- Hamburger Menu Button -->
        <button class="hamburger" id="hamburgerBtn" aria-label="Toggle navigation menu" aria-expanded="false">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
        
        <!-- Navigation Links -->
        <ul class="nav-links" id="navLinks" role="menubar">
          <li role="none"><a href="#" data-page="home" role="menuitem">Home</a></li>
          <li role="none"><a href="#" data-page="about" role="menuitem">About</a></li>
          <li role="none"><a href="#" data-page="contact" role="menuitem">Contact</a></li>
          <li role="none"><a href="#" data-page="account" role="menuitem">Account</a></li>
          <li role="none"><a href="#" data-page="admin" role="menuitem">Admin</a></li>
        </ul>
      </div>
    </nav>
  `;
  
  document.body.insertAdjacentHTML('afterbegin', navigation);
  attachHamburgerMenu();
}

// Optimized hamburger menu with better performance
function attachHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');
  const nav = document.querySelector('.nav');
  
  if (!hamburgerBtn || !navLinks) return;
  
  // Use event delegation for better performance
  hamburgerBtn.addEventListener('click', toggleMenu);
  navLinks.addEventListener('click', handleNavClick);
  document.addEventListener('click', handleOutsideClick);
  document.addEventListener('keydown', handleEscapeKey);
  window.addEventListener('resize', handleResize);
  
  function toggleMenu() {
    const isActive = hamburgerBtn.classList.contains('active');
    
    hamburgerBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
    nav.classList.toggle('menu-open');
    
    // Use transform instead of overflow for better performance
    document.body.style.overflow = isActive ? '' : 'hidden';
    hamburgerBtn.setAttribute('aria-expanded', !isActive);
  }
  
  function handleNavClick(e) {
    if (e.target.hasAttribute('data-page')) {
      closeMenu();
    }
  }
  
  function handleOutsideClick(e) {
    if (!nav.contains(e.target) && navLinks.classList.contains('active')) {
      closeMenu();
    }
  }
  
  function handleEscapeKey(e) {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      closeMenu();
    }
  }
  
  function handleResize() {
    if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
      closeMenu();
    }
  }
  
  function closeMenu() {
    hamburgerBtn.classList.remove('active');
    navLinks.classList.remove('active');
    nav.classList.remove('menu-open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}

// Optimized page rendering with lazy loading
async function renderCurrentPage() {
  const app = document.getElementById('app');
  
  // Show loading state for better UX
  app.innerHTML = '<div class="loading-spinner" aria-live="polite">Loading...</div>';
  
  try {
    switch (appState.currentPage) {
      case 'home':
        app.innerHTML = renderHomePage();
        break;
      case 'about':
        app.innerHTML = renderAboutPage();
        break;
      case 'contact':
        app.innerHTML = renderContactPage();
        await loadEmailService(); // Load email service when contact page is rendered
        attachContactFormListener();
        break;
      case 'account':
        await loadFirebaseService(); // Load Firebase when account page is needed
        app.innerHTML = renderAccountPage();
        attachAccountListeners();
        if (appState.isUserLoggedIn) {
          scheduleWork(() => loadUserDashboardData());
        }
        break;
      case 'admin':
        await loadFirebaseService(); // Load Firebase when admin page is needed
        app.innerHTML = renderAdminPage();
        if (appState.isAdminLoggedIn) {
          scheduleWork(() => {
            attachAdminListeners();
            loadAdminData();
          });
        }
        break;
      default:
        app.innerHTML = renderHomePage();
    }
  } catch (error) {
    console.error('Error rendering page:', error);
    app.innerHTML = '<div class="error-message">Error loading page. Please try again.</div>';
  }
}

// Optimized event listeners with performance considerations
function attachEventListeners() {
  // Use event delegation for better performance
  document.addEventListener('click', handleGlobalClick);
  window.addEventListener('hashchange', handleHashChange);
  window.addEventListener('popstate', handlePopState);
}

function handleGlobalClick(e) {
  const target = e.target.closest('[data-page]');
  if (target) {
    e.preventDefault();
    const page = target.getAttribute('data-page');
    navigateToPage(page);
  }
}

function handleHashChange() {
  const hash = window.location.hash.slice(1);
  if (hash && hash !== appState.currentPage) {
    navigateToPage(hash);
  }
}

function handlePopState() {
  const hash = window.location.hash.slice(1) || 'home';
  navigateToPage(hash, false);
}

function navigateToPage(page, updateHistory = true) {
  appState.currentPage = page;
  
  if (updateHistory) {
    history.pushState({ page }, '', page === 'home' ? '/' : `#${page}`);
  }
  
  renderCurrentPage();
}

// Initialize EmailJS with error handling
async function initializeEmailJS() {
  try {
    const emailModule = await loadEmailService();
    if (emailModule && emailModule.emailService) {
      emailModule.emailService.init();
    }
  } catch (error) {
    console.error('Failed to initialize EmailJS:', error);
  }
}

// Export for testing and debugging
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { appState, renderCurrentPage, navigateToPage };
}
