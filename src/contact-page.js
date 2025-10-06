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
function renderContactPageContent() {
  const contentContainer = document.getElementById('contact-content');
  
  if (!contentContainer) return;
  
  if (currentUser) {
    // User is logged in - show project options
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
        
        <button type="submit" class="btn">Sign In</button>
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
        
        <button type="submit" class="btn">Create Account</button>
      </form>
    </div>
  `;
}

/**
 * Attach auth form listeners
 */
function attachAuthFormListeners() {
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
    const name = document.getElementById('signUpName').value;
    const businessName = document.getElementById('signUpBusinessName').value;
    const email = document.getElementById('signUpEmail').value;
    const phone = document.getElementById('signUpPhone').value;
    const password = document.getElementById('signUpPassword').value;
    
    const result = await firebaseService.signUp(email, password, {
      name,
      businessName,
      phone
    });
    
    if (result.success) {
      showNotification('Account created successfully!', 'success');
      // User profile will be created in firebase-service
    } else {
      showNotification(result.message, 'error');
    }
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
      <form id="inquiryForm">
        <div class="form-group">
          <label>Name</label>
          <input type="text" id="inquiryName" value="${profile.name || ''}" readonly />
        </div>
        
        <div class="form-group">
          <label>Business Name</label>
          <input type="text" id="inquiryBusinessName" value="${profile.businessName || ''}" readonly />
        </div>
        
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="inquiryEmail" value="${currentUser.email}" readonly />
        </div>
        
        <div class="form-group">
          <label>Phone</label>
          <input type="tel" id="inquiryPhone" value="${profile.phone || ''}" readonly />
        </div>
        
        <div class="form-group">
          <label>Project Description *</label>
          <textarea id="inquiryDescription" rows="6" required placeholder="Tell us about your project..."></textarea>
        </div>
        
        <button type="submit" class="btn">Submit Inquiry</button>
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('projectView').innerHTML = ''">Cancel</button>
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
  
  const formData = {
    userId: currentUser.uid,
    name: document.getElementById('inquiryName').value,
    businessName: document.getElementById('inquiryBusinessName').value,
    email: document.getElementById('inquiryEmail').value,
    phone: document.getElementById('inquiryPhone').value,
    message: document.getElementById('inquiryDescription').value,
    timestamp: new Date().toISOString()
  };
  
  // Save to Firebase
  const saveResult = await firebaseService.saveSubmission(formData);
  
  if (saveResult.success) {
    // Send to Discord
    const discordResult = await sendInquiryToDiscord(formData);
    
    if (discordResult.success) {
      showNotification('Inquiry submitted successfully!', 'success');
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
  
  // Load user's projects from Firebase
  const result = await firebaseService.getUserSubmissions(currentUser.uid);
  
  if (result.success && result.submissions.length > 0) {
    userProjects = result.submissions;
    projectView.innerHTML = renderProjectsList(result.submissions);
    attachProjectListeners();
  } else {
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
      <p>Report an issue or request changes for your project</p>
      <form id="sosForm">
        <input type="hidden" id="sosProjectId" value="${projectId}" />
        
        <div class="form-group">
          <label>Issue/Request *</label>
          <textarea id="sosMessage" rows="6" required placeholder="Describe the issue or changes needed..."></textarea>
        </div>
        
        <button type="submit" class="btn">Send SOS</button>
        <button type="button" class="btn btn-secondary" onclick="location.reload()">Cancel</button>
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
