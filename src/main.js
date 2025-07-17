import './style.css';
import { firebaseService } from './firebase-service.js';
import { emailService } from './email-service.js';

// Application state
const appState = {
  currentPage: 'home',
  isAdminLoggedIn: false,
  currentUser: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  renderNavigation();
  renderCurrentPage();
  attachEventListeners();
  createFloatingElements();
  initializeDarkMode();
  
  // Set up Firebase Auth state listener
  firebaseService.onAuthStateChange((user) => {
    appState.isAdminLoggedIn = !!user;
    appState.currentUser = user;
    
    // If we're on the admin page, re-render to show/hide content
    if (appState.currentPage === 'admin') {
      renderCurrentPage();
    }
  });
}

// Navigation rendering
function renderNavigation() {
  const navigation = `
    <nav class="nav">
      <div class="nav-container">
        <a href="#" class="logo" data-page="home">RNDM DEVS</a>
        <ul class="nav-links">
          <li><a href="#" data-page="home">Home</a></li>
          <li><a href="#" data-page="contact">Contact</a></li>
          <li><a href="#" data-page="admin">Admin</a></li>
        </ul>
      </div>
    </nav>
  `;
  
  document.body.insertAdjacentHTML('afterbegin', navigation);
}

// Page rendering
function renderCurrentPage() {
  const app = document.getElementById('app');
  
  switch (appState.currentPage) {
    case 'home':
      app.innerHTML = renderHomePage();
      break;
    case 'contact':
      app.innerHTML = renderContactPage();
      attachContactFormListener();
      break;
    case 'admin':
      app.innerHTML = renderAdminPage();
      if (!appState.isAdminLoggedIn) {
        attachAdminLoginListener();
      } else {
        loadContactSubmissions();
        attachEditFormListener();
        attachFilterListeners();
        initializeNotifications();
      }
      break;
    default:
      app.innerHTML = renderHomePage();
  }
}

// Home page template
function renderHomePage() {
  return `
    <div class="page-section active">
      <div class="container">
        <section class="hero">
          <h1 class="glitch">RNDM Development</h1>
          <p>Professional yet fun random website development</p>
          <p>Where creativity meets code and chaos creates brilliance</p>
          <div style="margin-top: 2rem;">
            <a href="#" class="btn" data-page="contact">Get In Touch</a>
            <a href="#" class="btn btn-secondary" data-page="admin" style="margin-left: 1rem;">Admin Portal</a>
          </div>
        </section>
        
        <section style="padding: 4rem 0; text-align: center;">
          <h2 style="color: var(--secondary-color); margin-bottom: 2rem; font-family: var(--font-tech);">What We Do</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 3rem;">
            <div style="background: rgba(20, 20, 20, 0.8); padding: 2rem; border-radius: 10px; border: 1px solid var(--border-color);">
              <h3 style="color: var(--primary-color); margin-bottom: 1rem;">🚀 Web Development</h3>
              <p>Modern, responsive websites with cutting-edge technology and professional design.</p>
            </div>
            <div style="background: rgba(20, 20, 20, 0.8); padding: 2rem; border-radius: 10px; border: 1px solid var(--border-color);">
              <h3 style="color: var(--secondary-color); margin-bottom: 1rem;">⚡ Performance Optimization</h3>
              <p>Lightning-fast websites optimized for speed, SEO, and user experience.</p>
            </div>
            <div style="background: rgba(20, 20, 20, 0.8); padding: 2rem; border-radius: 10px; border: 1px solid var(--border-color);">
              <h3 style="color: var(--accent-color); margin-bottom: 1rem;">🎨 Creative Design</h3>
              <p>Unique, engaging designs that blend professionalism with creative flair.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;
}

// Contact page template
function renderContactPage() {
  return `
    <div class="page-section active">
      <div class="container">
        <h1 class="section-title">Contact RNDM DEVS</h1>
        <div class="contact-section">
          <form class="contact-form" id="contactForm">
            <div class="form-group">
              <label for="name">Name *</label>
              <input type="text" id="name" name="name" required>
            </div>
            
            <div class="form-group">
              <label for="email">Email *</label>
              <input type="email" id="email" name="email" required>
            </div>
            
            <div class="form-group">
              <label for="company">Company/Organization</label>
              <input type="text" id="company" name="company">
            </div>
            
            <div class="form-group">
              <label for="project">Project Type</label>
              <select id="project" name="project">
                <option value="">Select a project type</option>
                <option value="website">Website Development</option>
                <option value="redesign">Website Redesign</option>
                <option value="optimization">Performance Optimization</option>
                <option value="maintenance">Website Maintenance</option>
                <option value="consultation">Consultation</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="budget">Budget Range</label>
              <select id="budget" name="budget">
                <option value="">Select budget range</option>
                <option value="under-100">Under $100</option>
                <option value="100-500">$100 - $500</option>
                <option value="500-1k">$500 - $1,000</option>
                <option value="1k-2.5k">$1,000 - $2,500</option>
                <option value="2.5k-plus">$2,500+</option>
                <option value="discuss">Let's discuss</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="message">Project Details *</label>
              <textarea id="message" name="message" placeholder="Tell us about your project, goals, timeline, and any specific requirements..." required></textarea>
            </div>
            
            <button type="submit" class="btn" style="width: 100%; margin-top: 1rem;">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Admin page template
function renderAdminPage() {
  if (!appState.isAdminLoggedIn) {
    return `
      <div class="page-section active">
        <div class="container">
          <div class="admin-login">
            <h2>Admin Access</h2>
            <p style="margin-bottom: 2rem; color: var(--text-gray);">
              Sign in to view contact submissions
            </p>
            
            <form id="adminAuthForm">
              <div class="form-group">
                <label for="adminEmail">Email</label>
                <input type="email" id="adminEmail" placeholder="Email" required style="width: 100%; padding: 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid var(--border-color); border-radius: 5px; color: var(--text-light); font-size: 1rem;">
              </div>
              <div class="form-group">
                <label for="adminPassword">Password</label>
                <input type="password" id="adminPassword" placeholder="Password" required style="width: 100%; padding: 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid var(--border-color); border-radius: 5px; color: var(--text-light); font-size: 1rem;">
              </div>
              <button type="submit" class="btn" style="width: 100%;">
                Sign In
              </button>
            </form>
            
            <div style="margin-top: 2rem; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 5px; border: 1px solid var(--border-color);">
              <p style="color: var(--text-gray); font-size: 0.9rem; margin: 0; text-align: center;">
                � Authorized personnel only
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="page-section active">
      <div class="container">
        <h1 class="section-title">Admin Dashboard</h1>
        
        <!-- Analytics Dashboard -->
        <div class="admin-analytics" id="adminAnalytics">
          <div class="analytics-grid">
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-info">
                <h3 id="totalSubmissions">0</h3>
                <p>Total Submissions</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📅</div>
              <div class="stat-info">
                <h3 id="thisMonth">0</h3>
                <p>This Month</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">💰</div>
              <div class="stat-info">
                <h3 id="avgBudget">$0</h3>
                <p>Avg Budget</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🔥</div>
              <div class="stat-info">
                <h3 id="topProject">-</h3>
                <p>Top Project Type</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Controls Section -->
        <div class="admin-controls">
          <div class="controls-header">
            <div class="controls-left">
              <h2 style="color: var(--primary-color); margin: 0;">Contact Submissions</h2>
              <p style="color: var(--text-gray); margin: 0.5rem 0 0 0;">
                Signed in as: ${appState.currentUser?.email || 'Unknown'}
              </p>
            </div>
            <div class="controls-right">
              <button class="btn btn-icon" onclick="toggleDarkMode()" title="Toggle Dark Mode">🌙</button>
              <button class="btn btn-secondary" onclick="testEmailNotification()" title="Test Email">📧 Test Email</button>
              <button class="btn btn-secondary" onclick="exportData('csv')">📋 Export CSV</button>
              <button class="btn btn-secondary" onclick="exportData('json')">📄 Export JSON</button>
              <button class="btn btn-secondary" onclick="handleSignOut()">Sign Out</button>
            </div>
          </div>

          <!-- Search and Filter Controls -->
          <div class="filter-controls">
            <div class="filter-row">
              <input type="text" id="searchFilter" placeholder="Search by name, email, or company..." class="filter-input">
              <select id="projectFilter" class="filter-select">
                <option value="">All Projects</option>
                <option value="website">Website Development</option>
                <option value="redesign">Website Redesign</option>
                <option value="optimization">Performance Optimization</option>
                <option value="maintenance">Website Maintenance</option>
                <option value="consultation">Consultation</option>
                <option value="other">Other</option>
              </select>
              <select id="budgetFilter" class="filter-select">
                <option value="">All Budgets</option>
                <option value="under-100">Under $100</option>
                <option value="100-500">$100 - $500</option>
                <option value="500-1k">$500 - $1,000</option>
                <option value="1k-2.5k">$1,000 - $2,500</option>
                <option value="2.5k-plus">$2,500+</option>
                <option value="discuss">Let's discuss</option>
              </select>
              <select id="statusFilter" class="filter-select">
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div class="filter-row">
              <input type="date" id="dateFrom" class="filter-input" title="From Date">
              <input type="date" id="dateTo" class="filter-input" title="To Date">
              <button class="btn btn-primary" onclick="applyFilters()">🔍 Apply Filters</button>
              <button class="btn btn-secondary" onclick="clearFilters()">Clear</button>
            </div>
          </div>
        </div>

        <!-- Submissions Container -->
        <div id="submissionsContainer">
          <div class="loading">
            <div class="loading-spinner"></div>
            <p>Loading submissions...</p>
          </div>
        </div>

        <!-- Notification Badge for New Submissions -->
        <div id="newSubmissionBadge" class="notification-badge" style="display: none;">
          <span id="newSubmissionCount">0</span> new submission(s)
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div id="editModal" class="modal" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Edit Submission</h3>
          <button class="modal-close" onclick="closeEditModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="editSubmissionForm">
            <input type="hidden" id="editSubmissionId">
            <div class="form-row">
              <div class="form-group">
                <label for="editName">Name</label>
                <input type="text" id="editName" required>
              </div>
              <div class="form-group">
                <label for="editEmail">Email</label>
                <input type="email" id="editEmail" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="editCompany">Company</label>
                <input type="text" id="editCompany">
              </div>
              <div class="form-group">
                <label for="editProject">Project Type</label>
                <select id="editProject">
                  <option value="website">Website Development</option>
                  <option value="redesign">Website Redesign</option>
                  <option value="optimization">Performance Optimization</option>
                  <option value="maintenance">Website Maintenance</option>
                  <option value="consultation">Consultation</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="editBudget">Budget</label>
                <select id="editBudget">
                  <option value="under-100">Under $100</option>
                  <option value="100-500">$100 - $500</option>
                  <option value="500-1k">$500 - $1,000</option>
                  <option value="1k-2.5k">$1,000 - $2,500</option>
                  <option value="2.5k-plus">$2,500+</option>
                  <option value="discuss">Let's discuss</option>
                </select>
              </div>
              <div class="form-group">
                <label for="editStatus">Status</label>
                <select id="editStatus">
                  <option value="new">New</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label for="editMessage">Message</label>
              <textarea id="editMessage" rows="4"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" onclick="closeEditModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div id="detailModal" class="modal" style="display: none;">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3>Submission Details</h3>
          <button class="modal-close" onclick="closeDetailModal()">&times;</button>
        </div>
        <div class="modal-body" id="detailModalBody">
          <!-- Details will be populated here -->
        </div>
      </div>
    </div>
  `;
}

// Event listeners
function attachEventListeners() {
  // Navigation click handler
  document.addEventListener('click', (e) => {
    if (e.target.hasAttribute('data-page')) {
      e.preventDefault();
      navigateToPage(e.target.getAttribute('data-page'));
    }
  });
  
  // Make logout function globally available
  window.handleSignOut = async () => {
    const result = await firebaseService.signOutAdmin();
    if (result.success) {
      showNotification(result.message, 'success');
    } else {
      showNotification(result.message, 'error');
    }
  };
}

// Contact form event listener
function attachContactFormListener() {
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      // Validate required fields
      if (!data.name || !data.email || !data.message) {
        showNotification('Please fill in all required fields', 'error');
        return;
      }
      
      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
      
      try {
        const result = await firebaseService.submitContactForm(data);
        
        if (result.success) {
          showNotification(result.message, 'success');
          form.reset();
        } else {
          showNotification(result.message, 'error');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        showNotification('An error occurred. Please try again.', 'error');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

// Admin authentication event listener
function attachAdminLoginListener() {
  const form = document.getElementById('adminAuthForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('adminEmail').value;
      const password = document.getElementById('adminPassword').value;
      
      if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
      }
      
      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Signing In...';
      submitBtn.disabled = true;
      
      try {
        const result = await firebaseService.signInAdmin(email, password);
        
        if (result.success) {
          showNotification(result.message, 'success');
          // The auth state listener will handle updating the UI
        } else {
          showNotification(result.message, 'error');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        showNotification('An error occurred. Please try again.', 'error');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

// Load contact submissions for admin
let allSubmissions = [];
let filteredSubmissions = [];
let newSubmissionCount = 0;

function loadContactSubmissions() {
  const container = document.getElementById('submissionsContainer');
  
  firebaseService.onContactFormsChange((submissions) => {
    // Track new submissions for notifications
    if (allSubmissions.length > 0 && submissions.length > allSubmissions.length) {
      const newCount = submissions.length - allSubmissions.length;
      newSubmissionCount += newCount;
      showNewSubmissionNotification();
      
      // Get the newest submission
      const newestSubmission = submissions[submissions.length - 1];
      
      // Send browser notification
      sendBrowserNotification(newestSubmission);
      
      // Send email notification
      sendEmailNotification(newestSubmission);
    }
    
    allSubmissions = submissions;
    filteredSubmissions = [...submissions];
    
    // Update analytics
    updateAnalytics(submissions);
    
    if (submissions.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-gray);">
          <h3>No submissions yet</h3>
          <p>Contact form submissions will appear here.</p>
        </div>
      `;
      return;
    }
    
    renderSubmissionsTable(filteredSubmissions);
  });
}

// Helper functions for display text conversion
function getProjectDisplayText(value) {
  const projectTypes = {
    'website': 'Website Development',
    'redesign': 'Website Redesign',
    'optimization': 'Performance Optimization',
    'maintenance': 'Website Maintenance',
    'consultation': 'Consultation',
    'other': 'Other'
  };
  return projectTypes[value] || value || 'N/A';
}

function getBudgetDisplayText(value) {
  const budgetRanges = {
    'under-100': 'Under $100',
    '100-500': '$100 - $500',
    '500-1k': '$500 - $1,000',
    '1k-2.5k': '$1,000 - $2,500',
    '2.5k-plus': '$2,500+',
    'discuss': "Let's discuss"
  };
  return budgetRanges[value] || value || 'N/A';
}

function updateAnalytics(submissions) {
  // Total submissions
  document.getElementById('totalSubmissions').textContent = submissions.length;
  
  // This month submissions
  const now = new Date();
  const thisMonth = submissions.filter(s => {
    const date = new Date(s.timestamp);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  document.getElementById('thisMonth').textContent = thisMonth.length;
  
  // Average budget calculation
  const budgetRanges = {
    'under-100': 50,
    '100-500': 300,
    '500-1k': 750,
    '1k-2.5k': 1750,
    '2.5k-plus': 3500,
    'discuss': 0 // Don't include "Let's discuss" in average
  };
  
  const budgets = submissions
    .filter(s => s.budget && budgetRanges[s.budget] && s.budget !== 'discuss')
    .map(s => budgetRanges[s.budget]);
  
  const avgBudget = budgets.length > 0 
    ? Math.round(budgets.reduce((a, b) => a + b, 0) / budgets.length)
    : 0;
  
  document.getElementById('avgBudget').textContent = avgBudget > 0 ? `$${avgBudget.toLocaleString()}` : '$0';
  
  // Top project type
  const projectCounts = {};
  submissions.forEach(s => {
    if (s.project) {
      projectCounts[s.project] = (projectCounts[s.project] || 0) + 1;
    }
  });
  
  const topProject = Object.keys(projectCounts).length > 0
    ? Object.keys(projectCounts).reduce((a, b) => projectCounts[a] > projectCounts[b] ? a : b)
    : '-';
  
  document.getElementById('topProject').textContent = topProject;
}

function renderSubmissionsTable(submissions) {
  const container = document.getElementById('submissionsContainer');
  
  // Sort submissions by timestamp (newest first)
  submissions.sort((a, b) => b.timestamp - a.timestamp);
  
  const tableHTML = `
    <div class="submissions-table">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Email</th>
            <th>Company</th>
            <th>Project</th>
            <th>Budget</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${submissions.map(submission => {
            const status = submission.status || 'new';
            const statusClass = `status-${status}`;
            return `
              <tr class="submission-row">
                <td>${new Date(submission.timestamp).toLocaleDateString()}</td>
                <td>${submission.name || 'N/A'}</td>
                <td>${submission.email || 'N/A'}</td>
                <td>${submission.company || 'N/A'}</td>
                <td>${getProjectDisplayText(submission.project)}</td>
                <td>${getBudgetDisplayText(submission.budget)}</td>
                <td><span class="status-badge ${statusClass}">${status.replace('-', ' ')}</span></td>
                <td class="actions-cell">
                  <button class="btn-icon" onclick="viewSubmissionDetail('${submission.id}')" title="View Details">👁️</button>
                  <button class="btn-icon" onclick="editSubmission('${submission.id}')" title="Edit">✏️</button>
                  <button class="btn-icon" onclick="deleteSubmission('${submission.id}')" title="Delete">🗑️</button>
                  <button class="btn-icon" onclick="emailSubmission('${submission.id}')" title="Email">📧</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  container.innerHTML = tableHTML;
}

function showNewSubmissionNotification() {
  const badge = document.getElementById('newSubmissionBadge');
  const count = document.getElementById('newSubmissionCount');
  
  count.textContent = newSubmissionCount;
  badge.style.display = 'block';
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    badge.style.display = 'none';
    newSubmissionCount = 0;
  }, 10000);
}

// Filter functions
function applyFilters() {
  const searchTerm = document.getElementById('searchFilter').value.toLowerCase();
  const projectFilter = document.getElementById('projectFilter').value;
  const budgetFilter = document.getElementById('budgetFilter').value;
  const statusFilter = document.getElementById('statusFilter').value;
  const dateFrom = document.getElementById('dateFrom').value;
  const dateTo = document.getElementById('dateTo').value;
  
  filteredSubmissions = allSubmissions.filter(submission => {
    // Search filter
    if (searchTerm && !searchMatches(submission, searchTerm)) {
      return false;
    }
    
    // Project filter
    if (projectFilter && submission.project !== projectFilter) {
      return false;
    }
    
    // Budget filter
    if (budgetFilter && submission.budget !== budgetFilter) {
      return false;
    }
    
    // Status filter
    if (statusFilter && (submission.status || 'new') !== statusFilter) {
      return false;
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      const submissionDate = new Date(submission.timestamp).toISOString().split('T')[0];
      if (dateFrom && submissionDate < dateFrom) return false;
      if (dateTo && submissionDate > dateTo) return false;
    }
    
    return true;
  });
  
  renderSubmissionsTable(filteredSubmissions);
}

function searchMatches(submission, searchTerm) {
  const searchFields = [
    submission.name,
    submission.email,
    submission.company,
    submission.message
  ];
  
  return searchFields.some(field => 
    field && field.toLowerCase().includes(searchTerm)
  );
}

function clearFilters() {
  document.getElementById('searchFilter').value = '';
  document.getElementById('projectFilter').value = '';
  document.getElementById('budgetFilter').value = '';
  document.getElementById('statusFilter').value = '';
  document.getElementById('dateFrom').value = '';
  document.getElementById('dateTo').value = '';
  
  filteredSubmissions = [...allSubmissions];
  renderSubmissionsTable(filteredSubmissions);
}

// Export functions
function exportData(format) {
  if (filteredSubmissions.length === 0) {
    showNotification('No data to export', 'warning');
    return;
  }
  
  const data = filteredSubmissions.map(submission => ({
    Date: new Date(submission.timestamp).toLocaleDateString(),
    Name: submission.name || '',
    Email: submission.email || '',
    Company: submission.company || '',
    Project: getProjectDisplayText(submission.project),
    Budget: getBudgetDisplayText(submission.budget),
    Status: submission.status || 'new',
    Message: submission.message || ''
  }));
  
  if (format === 'csv') {
    exportToCSV(data);
  } else if (format === 'json') {
    exportToJSON(data);
  }
}

function exportToCSV(data) {
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header].replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  downloadFile(csvContent, 'submissions.csv', 'text/csv');
}

function exportToJSON(data) {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, 'submissions.json', 'application/json');
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showNotification(`${filename} downloaded successfully`, 'success');
}

// Modal functions
function editSubmission(id) {
  const submission = allSubmissions.find(s => s.id === id);
  if (!submission) return;
  
  // Populate form
  document.getElementById('editSubmissionId').value = id;
  document.getElementById('editName').value = submission.name || '';
  document.getElementById('editEmail').value = submission.email || '';
  document.getElementById('editCompany').value = submission.company || '';
  document.getElementById('editProject').value = submission.project || '';
  document.getElementById('editBudget').value = submission.budget || '';
  document.getElementById('editStatus').value = submission.status || 'new';
  document.getElementById('editMessage').value = submission.message || '';
  
  // Show modal
  document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

function viewSubmissionDetail(id) {
  const submission = allSubmissions.find(s => s.id === id);
  if (!submission) return;
  
  const detailHTML = `
    <div class="submission-detail">
      <div class="detail-grid">
        <div class="detail-item">
          <label>Date Submitted:</label>
          <span>${new Date(submission.timestamp).toLocaleString()}</span>
        </div>
        <div class="detail-item">
          <label>Name:</label>
          <span>${submission.name || 'N/A'}</span>
        </div>
        <div class="detail-item">
          <label>Email:</label>
          <span>${submission.email || 'N/A'}</span>
        </div>
        <div class="detail-item">
          <label>Company:</label>
          <span>${submission.company || 'N/A'}</span>
        </div>
        <div class="detail-item">
          <label>Project Type:</label>
          <span>${getProjectDisplayText(submission.project)}</span>
        </div>
        <div class="detail-item">
          <label>Budget:</label>
          <span>${getBudgetDisplayText(submission.budget)}</span>
        </div>
        <div class="detail-item">
          <label>Status:</label>
          <span class="status-badge status-${submission.status || 'new'}">${(submission.status || 'new').replace('-', ' ')}</span>
        </div>
      </div>
      <div class="detail-message">
        <label>Message:</label>
        <div class="message-content">${submission.message || 'No message provided'}</div>
      </div>
      <div class="detail-actions">
        <button class="btn btn-primary" onclick="editSubmission('${id}'); closeDetailModal();">Edit Submission</button>
        <button class="btn btn-secondary" onclick="emailSubmission('${id}')">Send Email</button>
      </div>
    </div>
  `;
  
  document.getElementById('detailModalBody').innerHTML = detailHTML;
  document.getElementById('detailModal').style.display = 'flex';
}

function closeDetailModal() {
  document.getElementById('detailModal').style.display = 'none';
}

function deleteSubmission(id) {
  if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
    return;
  }
  
  firebaseService.deleteContactSubmission(id)
    .then(result => {
      if (result.success) {
        showNotification('Submission deleted successfully', 'success');
      } else {
        showNotification(result.message, 'error');
      }
    })
    .catch(error => {
      console.error('Delete error:', error);
      showNotification('Failed to delete submission', 'error');
    });
}

function emailSubmission(id) {
  const submission = allSubmissions.find(s => s.id === id);
  if (!submission || !submission.email) {
    showNotification('No email address found for this submission', 'error');
    return;
  }
  
  const subject = encodeURIComponent(`Re: Your inquiry about ${getProjectDisplayText(submission.project)}`);
  const body = encodeURIComponent(`Hi ${submission.name || 'there'},\n\nThank you for your inquiry about ${getProjectDisplayText(submission.project)}. We've received your message and will get back to you shortly.\n\nBest regards,\nRNDM Development Team`);
  
  window.open(`mailto:${submission.email}?subject=${subject}&body=${body}`);
}

// Dark mode toggle
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark);
  
  const btn = document.querySelector('.btn-icon[onclick="toggleDarkMode()"]');
  if (btn) {
    btn.textContent = isDark ? '☀️' : '🌙';
  }
}

// Initialize dark mode from localStorage
function initializeDarkMode() {
  const isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) {
    document.body.classList.add('dark-mode');
  }
}

// Browser notification functions
async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

function sendBrowserNotification(submission) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification('New Contact Submission! 🚀', {
      body: `${submission.name} submitted a ${getProjectDisplayText(submission.project)} inquiry`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'new-submission',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Submission' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });

    notification.onclick = () => {
      window.focus();
      navigateToPage('admin');
      notification.close();
    };

    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);
  }
}

// Initialize notifications when admin logs in
async function initializeNotifications() {
  const hasPermission = await requestNotificationPermission();
  if (hasPermission) {
    showNotification('Desktop notifications enabled! 🔔', 'success');
  } else {
    showNotification('Enable notifications in your browser to get alerts for new submissions', 'info');
  }
  
  // Initialize EmailJS (you'll need to configure this)
  initializeEmailJS();
}

// Send email notification for new submission
async function sendEmailNotification(submission) {
  try {
    const result = await emailService.sendNewSubmissionEmail(submission);
    if (result.success) {
      console.log('Email notification sent successfully');
    } else {
      console.log('Email notification not sent:', result.message);
    }
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

// Initialize EmailJS service
function initializeEmailJS() {
  // TODO: Replace these with your actual EmailJS credentials
  // Get these from https://www.emailjs.com/
  const SERVICE_ID = 'YOUR_SERVICE_ID';
  const TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  
  const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
  
  // Check if credentials are configured
  if (SERVICE_ID === 'YOUR_SERVICE_ID' || !SERVICE_ID) {
    console.log('EmailJS not configured yet. Follow the setup guide to enable email notifications.');
    return;
  }
  
  try {
    emailService.init(SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY);
    console.log('Email notifications initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize email service:', error);
  }
}

// Navigation function
function navigateToPage(page) {
  appState.currentPage = page;
  renderCurrentPage();
  
  // Update active nav link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.style.color = link.getAttribute('data-page') === page ? 'var(--primary-color)' : 'var(--text-light)';
  });
}

// Notification system
function showNotification(message, type = 'info') {
  // Remove existing notification
  const existing = document.querySelector('.notification');
  if (existing) {
    existing.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // Hide notification after 5 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 5000);
}

// Create floating tech elements
function createFloatingElements() {
  const elements = ['{ }', '</>', '01', 'λ', '∞', '⚡', '🚀', '⭐'];
  
  elements.forEach((element, index) => {
    const floatingEl = document.createElement('div');
    floatingEl.className = 'floating-element';
    floatingEl.textContent = element;
    floatingEl.style.left = Math.random() * 100 + '%';
    floatingEl.style.top = Math.random() * 100 + '%';
    floatingEl.style.animationDelay = index * 0.5 + 's';
    floatingEl.style.fontSize = Math.random() * 20 + 20 + 'px';
    
    document.body.appendChild(floatingEl);
  });
}

// Edit form event listener
function attachEditFormListener() {
  const form = document.getElementById('editSubmissionForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const id = document.getElementById('editSubmissionId').value;
      const updatedData = {
        name: document.getElementById('editName').value,
        email: document.getElementById('editEmail').value,
        company: document.getElementById('editCompany').value,
        project: document.getElementById('editProject').value,
        budget: document.getElementById('editBudget').value,
        status: document.getElementById('editStatus').value,
        message: document.getElementById('editMessage').value
      };
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Saving...';
      submitBtn.disabled = true;
      
      try {
        const result = await firebaseService.updateContactSubmission(id, updatedData);
        
        if (result.success) {
          showNotification('Submission updated successfully', 'success');
          closeEditModal();
        } else {
          showNotification(result.message, 'error');
        }
      } catch (error) {
        console.error('Update error:', error);
        showNotification('Failed to update submission', 'error');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

// Filter event listeners
function attachFilterListeners() {
  const searchFilter = document.getElementById('searchFilter');
  if (searchFilter) {
    searchFilter.addEventListener('input', debounce(applyFilters, 300));
  }
  
  // Real-time filtering for select dropdowns
  ['projectFilter', 'budgetFilter', 'statusFilter'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', applyFilters);
    }
  });
}

// Debounce function for search input
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Test email notification function
async function testEmailNotification() {
  const result = await emailService.sendTestEmail();
  if (result.success) {
    showNotification('Test email sent successfully! Check your inbox 📧', 'success');
  } else {
    showNotification(`Failed to send test email: ${result.message}`, 'error');
  }
}

// Global window functions for onclick handlers
window.toggleDarkMode = toggleDarkMode;
window.exportData = exportData;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.editSubmission = editSubmission;
window.closeEditModal = closeEditModal;
window.viewSubmissionDetail = viewSubmissionDetail;
window.closeDetailModal = closeDetailModal;
window.deleteSubmission = deleteSubmission;
window.emailSubmission = emailSubmission;
window.testEmailNotification = testEmailNotification;
