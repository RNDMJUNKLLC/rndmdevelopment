import './style.css';
import { firebaseService } from './firebase-service.js';

// Application state
const appState = {
  currentPage: 'home',
  isAdminLoggedIn: false,
  adminPassword: 'rndmdev2025' // Simple password protection
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
              <select id="project" name="project" style="width: 100%; padding: 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid var(--border-color); border-radius: 5px; color: var(--text-light); font-size: 1rem;">
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
              <select id="budget" name="budget" style="width: 100%; padding: 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid var(--border-color); border-radius: 5px; color: var(--text-light); font-size: 1rem;">
                <option value="">Select budget range</option>
                <option value="under-1k">Under $1,000</option>
                <option value="1k-5k">$1,000 - $5,000</option>
                <option value="5k-10k">$5,000 - $10,000</option>
                <option value="10k-25k">$10,000 - $25,000</option>
                <option value="25k-plus">$25,000+</option>
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
            <p style="margin-bottom: 2rem; color: var(--text-gray);">Enter password to view contact submissions</p>
            <form id="adminLoginForm">
              <div class="form-group">
                <input type="password" id="adminPassword" placeholder="Admin Password" style="width: 100%; padding: 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid var(--border-color); border-radius: 5px; color: var(--text-light); font-size: 1rem; text-align: center;">
              </div>
              <button type="submit" class="btn">Access Dashboard</button>
            </form>
          </div>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="page-section active">
      <div class="container">
        <h1 class="section-title">Admin Dashboard</h1>
        <div class="admin-section">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h2 style="color: var(--primary-color);">Contact Form Submissions</h2>
            <button class="btn btn-secondary" onclick="logout()">Logout</button>
          </div>
          <div id="submissionsContainer">
            <div class="loading">
              <div class="loading-spinner"></div>
              <p>Loading submissions...</p>
            </div>
          </div>
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
  window.logout = () => {
    appState.isAdminLoggedIn = false;
    navigateToPage('admin');
    showNotification('Logged out successfully', 'success');
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

// Admin login event listener
function attachAdminLoginListener() {
  const form = document.getElementById('adminLoginForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const password = document.getElementById('adminPassword').value;
      
      if (password === appState.adminPassword) {
        appState.isAdminLoggedIn = true;
        renderCurrentPage();
        showNotification('Welcome to admin dashboard', 'success');
      } else {
        showNotification('Invalid password', 'error');
        document.getElementById('adminPassword').value = '';
      }
    });
  }
}

// Load contact submissions for admin
function loadContactSubmissions() {
  const container = document.getElementById('submissionsContainer');
  
  firebaseService.onContactFormsChange((submissions) => {
    if (submissions.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-gray);">
          <h3>No submissions yet</h3>
          <p>Contact form submissions will appear here.</p>
        </div>
      `;
      return;
    }
    
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
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            ${submissions.map(submission => `
              <tr>
                <td>${new Date(submission.timestamp).toLocaleDateString()}</td>
                <td>${submission.name || 'N/A'}</td>
                <td>${submission.email || 'N/A'}</td>
                <td>${submission.company || 'N/A'}</td>
                <td>${submission.project || 'N/A'}</td>
                <td>${submission.budget || 'N/A'}</td>
                <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${submission.message || ''}">${submission.message || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    container.innerHTML = tableHTML;
  });
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
