// Contact page functionality
import { firebaseService } from './firebase-service.js';
import { sendInquiryToDiscord, sendSOSToDiscord, sendInvoiceRequestToDiscord } from './discord-webhook.js';
import { showNotification, getCurrentUser, isAuthenticated } from './shared.js';

let currentUser = null;
let userProjects = [];

/**
 * Initialize contact page
 */
export function initializeContactPage() {
  // Listen for auth state changes
  firebaseService.onAuthStateChange((user) => {
    currentUser = user;
    renderContactPageContent();
  });
}

/**
 * Render contact page content based on auth state
 */
async function renderContactPageContent() {
  const contentContainer = document.getElementById('contact-content');
  
  if (!contentContainer) return;
  
  if (currentUser) {
    // Check if user profile is complete
    const profileResult = await firebaseService.getUserProfile(currentUser.uid);
    if (profileResult.success) {
      const profile = profileResult.profile;
      // If missing business name or phone, show completion modal first
      if (!profile.businessName || !profile.phone) {
        contentContainer.innerHTML = renderProjectOptions();
        const projectView = document.getElementById('projectView');
        if (projectView) {
          showProfileCompletionModal(currentUser.uid, profile);
        }
        return;
      }
    }
    
    // User is logged in with complete profile - show project options
    contentContainer.innerHTML = renderProjectOptions();
    attachProjectOptionListeners();
  } else {
    // User not logged in - show sign in/sign up
    contentContainer.innerHTML = renderAuthForms();
    attachAuthFormListeners();
  }
}

/**
 * Render project options (New Project / Existing Projects)
 */
function renderProjectOptions() {
  return `
    <div class="project-options">
      <h2>Welcome back, ${currentUser.displayName || currentUser.email}!</h2>
      <p>What would you like to do today?</p>
      
      <div class="option-buttons">
        <button id="btnNewProject" class="btn btn-large">
          <span class="btn-icon">🆕</span>
          <span class="btn-text">New Project</span>
          <span class="btn-desc">Start a new inquiry</span>
        </button>
        
        <button id="btnExistingProjects" class="btn btn-secondary btn-large">
          <span class="btn-icon">📦</span>
          <span class="btn-text">Existing Projects</span>
          <span class="btn-desc">View your projects</span>
        </button>
      </div>
      
      <div id="projectView" class="project-view"></div>
    </div>
  `;
}

/**
 * Render authentication forms
 */
function renderAuthForms() {
  return `
    <div class="auth-container">
      <h2>Sign In or Create Account</h2>
      <p>Sign in to submit project inquiries and track your projects.</p>
      
      <!-- Google Sign In Button (Always visible) -->
      <div class="google-auth-section">
        <button id="btnGoogleSignIn" class="btn-google">
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          <span>Continue with Google</span>
        </button>
        <div class="divider"><span>or</span></div>
      </div>
      
      <div class="auth-tabs">
        <button id="tabSignIn" class="auth-tab active">Sign In</button>
        <button id="tabSignUp" class="auth-tab">Sign Up</button>
      </div>
      
      <!-- Sign In Form -->
      <form id="signInForm" class="auth-form">
        <div class="form-group">
          <label for="signInEmail">Email</label>
          <input type="email" id="signInEmail" required />
        </div>
        
        <div class="form-group">
          <label for="signInPassword">Password</label>
          <input type="password" id="signInPassword" required />
        </div>
        
        <button type="submit" class="btn">Sign In with Email</button>
      </form>
      
      <!-- Sign Up Form -->
      <form id="signUpForm" class="auth-form" style="display: none;">
        <div class="form-group">
          <label for="signUpName">Full Name *</label>
          <input type="text" id="signUpName" required />
        </div>
        
        <div class="form-group">
          <label for="signUpBusinessName">Business Name *</label>
          <input type="text" id="signUpBusinessName" required />
        </div>
        
        <div class="form-group">
          <label for="signUpEmail">Email *</label>
          <input type="email" id="signUpEmail" required />
        </div>
        
        <div class="form-group">
          <label for="signUpPhone">Phone (Optional)</label>
          <input type="tel" id="signUpPhone" />
        </div>
        
        <div class="form-group">
          <label for="signUpPassword">Password *</label>
          <input type="password" id="signUpPassword" minlength="6" required />
        </div>
        
        <button type="submit" class="btn">Create Account with Email</button>
      </form>
    </div>
  `;
}

/**
 * Attach auth form listeners
 */
function attachAuthFormListeners() {
  // Google Sign In Button
  const btnGoogleSignIn = document.getElementById('btnGoogleSignIn');
  btnGoogleSignIn?.addEventListener('click', async () => {
    const result = await firebaseService.signInWithGoogle();
    if (result.success) {
      showNotification('Signed in with Google!', 'success');
      
      // Check if profile needs completion (missing business name or phone)
      const profileResult = await firebaseService.getUserProfile(result.user.uid);
      if (profileResult.success) {
        const profile = profileResult.profile;
        if (!profile.businessName || !profile.phone) {
          // Show profile completion modal
          showProfileCompletionModal(result.user.uid, profile);
        }
      }
      // The auth state change will trigger re-render
    } else {
      showNotification(result.message, 'error');
    }
  });
  
  // Tab switching
  const tabSignIn = document.getElementById('tabSignIn');
  const tabSignUp = document.getElementById('tabSignUp');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  
  tabSignIn?.addEventListener('click', () => {
    tabSignIn.classList.add('active');
    tabSignUp.classList.remove('active');
    signInForm.style.display = 'block';
    signUpForm.style.display = 'none';
  });
  
  tabSignUp?.addEventListener('click', () => {
    tabSignUp.classList.add('active');
    tabSignIn.classList.remove('active');
    signUpForm.style.display = 'block';
    signInForm.style.display = 'none';
  });
  
  // Sign In
  signInForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    
    const result = await firebaseService.signIn(email, password);
    if (result.success) {
      showNotification('Signed in successfully!', 'success');
    } else {
      showNotification(result.message, 'error');
    }
  });
  
  // Sign Up
  signUpForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      const name = document.getElementById('signUpName').value;
      const businessName = document.getElementById('signUpBusinessName').value;
      const email = document.getElementById('signUpEmail').value;
      const phone = document.getElementById('signUpPhone').value;
      const password = document.getElementById('signUpPassword').value;
      
      console.log('Signing up with:', { name, businessName, email, phone });
      
      const result = await firebaseService.signUp(email, password, {
        name,
        businessName,
        phone
      });
      
      console.log('Sign up result:', result);
      
      if (result.success) {
        showNotification('Account created successfully! Welcome!', 'success');
        // User profile will be created in firebase-service
        // Auth state change will trigger re-render
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      showNotification('An unexpected error occurred. Please try again.', 'error');
    }
  });
}

/**
 * Show profile completion modal for Google Sign-In users
 */
function showProfileCompletionModal(userId, currentProfile) {
  const projectView = document.getElementById('projectView');
  if (!projectView) return;
  
  projectView.innerHTML = `
    <div class="profile-completion-modal">
      <h3>✏️ Complete Your Profile</h3>
      <p class="form-subtitle">Please provide some additional information to help us serve you better</p>
      <form id="profileCompletionForm">
        <div class="form-group">
          <label for="completeBusinessName">Business Name *</label>
          <input type="text" id="completeBusinessName" value="${currentProfile.businessName || ''}" required placeholder="Your business or personal name" />
        </div>
        
        <div class="form-group">
          <label for="completePhone">Phone Number *</label>
          <input type="tel" id="completePhone" value="${currentProfile.phone || ''}" required placeholder="(555) 123-4567" />
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Save & Continue</button>
          <button type="button" class="btn btn-secondary" id="skipProfileCompletion">Skip for Now</button>
        </div>
      </form>
    </div>
  `;
  
  // Handle form submission
  document.getElementById('profileCompletionForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const businessName = document.getElementById('completeBusinessName').value;
    const phone = document.getElementById('completePhone').value;
    
    // Update user profile in Firebase
    const updateResult = await firebaseService.updateUserProfile(userId, {
      businessName,
      phone
    });
    
    if (updateResult.success) {
      showNotification('Profile updated successfully!', 'success');
      projectView.innerHTML = '';
      // Re-render the contact page content
      renderContactPageContent();
    } else {
      showNotification('Failed to update profile. Please try again.', 'error');
    }
  });
  
  // Handle skip button
  document.getElementById('skipProfileCompletion')?.addEventListener('click', () => {
    projectView.innerHTML = '';
    renderContactPageContent();
  });
}

/**
 * Attach project option listeners
 */
function attachProjectOptionListeners() {
  const btnNewProject = document.getElementById('btnNewProject');
  const btnExistingProjects = document.getElementById('btnExistingProjects');
  
  btnNewProject?.addEventListener('click', showNewProjectForm);
  btnExistingProjects?.addEventListener('click', showExistingProjects);
}

/**
 * Show new project form
 */
async function showNewProjectForm() {
  const projectView = document.getElementById('projectView');
  if (!projectView) return;
  
  // Get user profile for auto-fill
  const profileResult = await firebaseService.getUserProfile(currentUser.uid);
  const profile = profileResult.success ? profileResult.profile : {};
  
  projectView.innerHTML = `
    <div class="new-project-form">
      <h3>🆕 New Project Inquiry</h3>
      <p class="form-subtitle">Tell us about your project and we'll get back to you within 24 hours!</p>
      <form id="inquiryForm">
        <div class="form-row">
          <div class="form-group">
            <label for="inquiryProjectType">Project Type *</label>
            <select id="inquiryProjectType" required>
              <option value="">Select project type...</option>
              <option value="website">🌐 Website</option>
              <option value="mobile-app">📱 Mobile App (Android)</option>
              <option value="web-app">💻 Web Application</option>
              <option value="ecommerce">🛒 E-commerce Site</option>
              <option value="software">⚙️ Custom Software</option>
              <option value="other">💡 Other</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="inquiryBudget">Budget Range *</label>
            <select id="inquiryBudget" required>
              <option value="">Select budget...</option>
              <option value="10-50">$10 - $50</option>
              <option value="50-100">$50 - $100</option>
              <option value="100-200">$100 - $200</option>
              <option value="200-300">$200 - $300</option>
              <option value="300+">$300+</option>
              <option value="flexible">Flexible / Discuss</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="inquiryTimeline">Timeline Preference *</label>
            <select id="inquiryTimeline" required>
              <option value="">Select timeline...</option>
              <option value="asap">⚡ ASAP (Rush)</option>
              <option value="1-2-weeks">📅 1-2 Weeks</option>
              <option value="2-4-weeks">📆 2-4 Weeks</option>
              <option value="1-2-months">🗓️ 1-2 Months</option>
              <option value="flexible">🕐 Flexible</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="inquiryPriority">Priority Level *</label>
            <select id="inquiryPriority" required>
              <option value="">Select priority...</option>
              <option value="urgent">🔴 Urgent</option>
              <option value="high">🟠 High</option>
              <option value="normal">🟢 Normal</option>
              <option value="low">🔵 Low Priority</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="inquiryDescription">Project Details *</label>
          <textarea id="inquiryDescription" rows="8" required placeholder="Tell us about your project...&#10;&#10;What are you looking to build?&#10;What features do you need?&#10;Do you have any design preferences?&#10;Any specific requirements or constraints?"></textarea>
          <small class="field-hint">Be as detailed as possible to help us understand your vision</small>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Submit Inquiry</button>
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('projectView').innerHTML = ''">Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.getElementById('inquiryForm')?.addEventListener('submit', handleInquirySubmit);
}

/**
 * Handle inquiry form submission
 */
async function handleInquirySubmit(e) {
  e.preventDefault();
  
  // Get user profile data
  const profileResult = await firebaseService.getUserProfile(currentUser.uid);
  const profile = profileResult.success ? profileResult.profile : {};
  
  const formData = {
    userId: currentUser.uid,
    name: profile.name || currentUser.displayName || 'N/A',
    businessName: profile.businessName || 'N/A',
    email: currentUser.email,
    phone: profile.phone || 'N/A',
    projectType: document.getElementById('inquiryProjectType').value,
    budget: document.getElementById('inquiryBudget').value,
    timeline: document.getElementById('inquiryTimeline').value,
    priority: document.getElementById('inquiryPriority').value,
    message: document.getElementById('inquiryDescription').value,
    timestamp: new Date().toISOString()
  };
  
  // Save to Firebase
  const saveResult = await firebaseService.saveSubmission(formData);
  
  if (saveResult.success) {
    // Send to Discord
    const discordResult = await sendInquiryToDiscord(formData);
    
    if (discordResult.success) {
      showNotification('Inquiry submitted successfully! We\'ll get back to you within 24 hours.', 'success');
      document.getElementById('projectView').innerHTML = '';
    } else {
      showNotification('Inquiry saved but notification failed. We\'ll get back to you soon!', 'info');
    }
  } else {
    showNotification(saveResult.message, 'error');
  }
}

/**
 * Show existing projects
 */
async function showExistingProjects() {
  const projectView = document.getElementById('projectView');
  if (!projectView) return;
  
  projectView.innerHTML = '<p>Loading your projects...</p>';
  
  try {
    // Load user's projects from Firebase
    const result = await firebaseService.getUserSubmissions(currentUser.uid);
    
    if (result.success && result.submissions.length > 0) {
      userProjects = result.submissions;
      projectView.innerHTML = renderProjectsList(result.submissions);
      attachProjectListeners();
    } else if (result.success && result.submissions.length === 0) {
      projectView.innerHTML = '<p>You don\'t have any projects yet. Start a new inquiry!</p>';
    } else {
      // Permission error or other issue - don't show scary error
      console.log('Note: Unable to load projects. This is expected for new accounts.');
      projectView.innerHTML = '<p>You don\'t have any projects yet. Start a new inquiry!</p>';
    }
  } catch (error) {
    console.log('Note: Unable to load projects:', error.message);
    projectView.innerHTML = '<p>You don\'t have any projects yet. Start a new inquiry!</p>';
  }
}

/**
 * Render projects list
 */
function renderProjectsList(projects) {
  const projectsHtml = projects.map((project, index) => `
    <div class="project-item" data-project-id="${project.id}">
      <div class="project-header">
        <h4>Project #${index + 1}</h4>
        <span class="project-date">${new Date(project.timestamp).toLocaleDateString()}</span>
      </div>
      <p class="project-description">${project.message || 'No description'}</p>
      <div class="project-actions">
        <button class="btn-sos" data-project-id="${project.id}">🚨 SOS</button>
      </div>
    </div>
  `).join('');
  
  return `
    <div class="existing-projects">
      <h3>📦 Your Projects</h3>
      <div class="projects-list">
        ${projectsHtml}
      </div>
      <button id="btnRequestInvoice" class="btn btn-secondary">💰 Request Invoice</button>
    </div>
  `;
}

/**
 * Attach project list listeners
 */
function attachProjectListeners() {
  // SOS buttons
  document.querySelectorAll('.btn-sos').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const projectId = e.target.dataset.projectId;
      showSOSForm(projectId);
    });
  });
  
  // Invoice request button
  document.getElementById('btnRequestInvoice')?.addEventListener('click', handleInvoiceRequest);
}

/**
 * Show SOS form for a project
 */
async function showSOSForm(projectId) {
  const project = userProjects.find(p => p.id === projectId);
  if (!project) return;
  
  const profileResult = await firebaseService.getUserProfile(currentUser.uid);
  const profile = profileResult.success ? profileResult.profile : {};
  
  const projectView = document.getElementById('projectView');
  projectView.innerHTML = `
    <div class="sos-form">
      <h3>🚨 SOS Request</h3>
      <p class="form-subtitle">Report an issue or request changes for your existing project</p>
      <form id="sosForm">
        <input type="hidden" id="sosProjectId" value="${projectId}" />
        
        <div class="form-group">
          <label for="sosRequestType">Request Type *</label>
          <select id="sosRequestType" required>
            <option value="">Select request type...</option>
            <option value="bug-fix">🐛 Bug Fix / Issue</option>
            <option value="feature-request">✨ Feature Request</option>
            <option value="redesign">🎨 Redesign / Upgrade</option>
            <option value="maintenance">🔧 Maintenance / Update</option>
            <option value="content-change">📝 Content Change</option>
            <option value="performance">⚡ Performance Issue</option>
            <option value="security">🔒 Security Concern</option>
            <option value="other">💡 Other</option>
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="sosTimeline">Timeline Preference *</label>
            <select id="sosTimeline" required>
              <option value="">Select timeline...</option>
              <option value="asap">⚡ ASAP (Rush)</option>
              <option value="1-2-weeks">📅 1-2 Weeks</option>
              <option value="2-4-weeks">📆 2-4 Weeks</option>
              <option value="1-2-months">🗓️ 1-2 Months</option>
              <option value="flexible">🕐 Flexible</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="sosPriority">Priority Level *</label>
            <select id="sosPriority" required>
              <option value="">Select priority...</option>
              <option value="urgent">🔴 Urgent</option>
              <option value="high">🟠 High</option>
              <option value="normal">🟢 Normal</option>
              <option value="low">🔵 Low Priority</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="sosMessage">Details *</label>
          <textarea id="sosMessage" rows="8" required placeholder="Describe the issue or changes needed...&#10;&#10;What's not working or what would you like changed?&#10;When did you notice this issue?&#10;What steps can we take to reproduce it?"></textarea>
          <small class="field-hint">Be as specific as possible to help us address your request quickly</small>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Send SOS</button>
          <button type="button" class="btn btn-secondary" onclick="location.reload()">Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.getElementById('sosForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const sosData = {
      userId: currentUser.uid,
      projectId: project.id,
      projectName: `Project #${userProjects.indexOf(project) + 1}`,
      name: profile.name || currentUser.displayName || '',
      businessName: profile.businessName || '',
      email: currentUser.email,
      phone: profile.phone || '',
      requestType: document.getElementById('sosRequestType').value,
      timeline: document.getElementById('sosTimeline').value,
      priority: document.getElementById('sosPriority').value,
      message: document.getElementById('sosMessage').value,
      timestamp: new Date().toISOString()
    };
    
    const result = await sendSOSToDiscord(sosData);
    
    if (result.success) {
      showNotification('SOS request sent successfully!', 'success');
      location.reload();
    } else {
      showNotification('Failed to send SOS. Please try again.', 'error');
    }
  });
}

/**
 * Handle invoice request
 */
async function handleInvoiceRequest() {
  const profileResult = await firebaseService.getUserProfile(currentUser.uid);
  const profile = profileResult.success ? profileResult.profile : {};
  
  const invoiceData = {
    userId: currentUser.uid,
    name: profile.name || currentUser.displayName || '',
    businessName: profile.businessName || '',
    email: currentUser.email,
    phone: profile.phone || '',
    projects: userProjects.map((p, i) => ({
      id: p.id,
      name: `Project #${i + 1}`
    }))
  };
  
  const result = await sendInvoiceRequestToDiscord(invoiceData);
  
  if (result.success) {
    showNotification('Invoice request sent! We\'ll contact you soon.', 'success');
  } else {
    showNotification('Failed to send invoice request. Please try again.', 'error');
  }
}
