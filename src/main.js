import './style.css';
import { firebaseService } from './firebase-service.js';
import { emailService } from './email-service.js';
import { adminConfig } from './firebase-config.js';

// Application state
const appState = {
  currentPage: 'home',
  isAdminLoggedIn: false,
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
  createFloatingElements();
  initializeDarkMode();
  
  // Initialize EmailJS early so it's ready for form submissions
  initializeEmailJS();
  
  // Set up Firebase Auth state listener
  firebaseService.onAuthStateChange(async (user) => {
    const wasAdminLoggedIn = appState.isAdminLoggedIn;
    const wasUserLoggedIn = appState.isUserLoggedIn;
    
    // Check if user is admin (you can add email checks here if needed)
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
  });
}

// Navigation rendering
function renderNavigation() {
  const navigation = `
    <nav class="nav">
      <div class="nav-container">
        <a href="#" class="logo" data-page="home">RNDM DEVS</a>
        
        <!-- Hamburger Menu Button -->
        <button class="hamburger" id="hamburgerBtn" aria-label="Toggle navigation menu">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
        
        <!-- Navigation Links -->
        <ul class="nav-links" id="navLinks">
          <li><a href="#" data-page="home">Home</a></li>
          <li><a href="#" data-page="about">About</a></li>
          <li><a href="#" data-page="services">Services</a></li>
          <li><a href="#" data-page="contact">Contact</a></li>
          <li><a href="#" data-page="account">Account</a></li>
          <li><a href="#" data-page="admin">Admin</a></li>
        </ul>
      </div>
    </nav>
  `;
  
  document.body.insertAdjacentHTML('afterbegin', navigation);
  
  // Add hamburger menu functionality
  attachHamburgerMenu();
}

// Hamburger menu functionality
function attachHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');
  const nav = document.querySelector('.nav');
  
  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', () => {
      // Toggle active states
      const isActive = hamburgerBtn.classList.contains('active');
      
      hamburgerBtn.classList.toggle('active');
      navLinks.classList.toggle('active');
      nav.classList.toggle('menu-open');
      
      // Toggle body scroll
      if (!isActive) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      
      // Toggle aria-expanded for accessibility
      const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
      hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
    });
    
    // Close menu when clicking on nav links
    navLinks.addEventListener('click', (e) => {
      if (e.target.hasAttribute('data-page')) {
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
    
    // Helper function to close menu
    function closeHamburgerMenu() {
      hamburgerBtn.classList.remove('active');
      navLinks.classList.remove('active');
      nav.classList.remove('menu-open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    
    // Set initial aria-expanded state
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    
    // Close menu when resizing to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
        closeHamburgerMenu();
      }
    });
  }
}

// Page rendering
function renderCurrentPage() {
  const app = document.getElementById('app');
  
  switch (appState.currentPage) {
    case 'home':
      app.innerHTML = renderHomePage();
      break;
    case 'about':
      app.innerHTML = renderAboutPage();
      break;
    case 'services':
      app.innerHTML = renderServicesPage();
      break;
    case 'contact':
      app.innerHTML = renderContactPage();
      attachContactFormListener();
      break;
    case 'account':
      app.innerHTML = renderAccountPage();
      attachAccountListeners();
      // Load dashboard data if user is logged in
      if (appState.isUserLoggedIn) {
        setTimeout(() => loadUserDashboardData(), 100); // Small delay to ensure DOM is ready
      }
      break;
    case 'admin':
      app.innerHTML = renderAdminPage();
      if (!appState.isAdminLoggedIn) {
        attachAdminLoginListener();
      } else {
        // Initialize admin dashboard with welcome tab
        setTimeout(() => {
          loadWelcomeContent();
          attachEditFormListener();
          attachFilterListeners();
          initializeNotifications();
          enhanceAdminTabsForMobile();
        }, 100);
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
            <a href="#" class="btn btn-secondary" data-page="account" style="margin-left: 1rem;">Account Access</a>
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

// About page template
function renderAboutPage() {
  return `
    <div class="page-section active">
      <div class="container">
        <h1 class="section-title">About RNDM Development</h1>
        
        <div class="about-content">
          <section class="hero-about">
            <div class="about-intro">
              <h2 class="glitch">Where Creativity Meets Code</h2>
              <p class="lead">We're not your average development team. We're the creative chaos that turns wild ideas into digital reality.</p>
            </div>
          </section>

          <div class="about-grid">
            <div class="about-card">
              <div class="card-icon">🚀</div>
              <h3>Our Mission</h3>
              <p>To bridge the gap between professional web development and creative innovation. We believe the best websites are born from organized chaos and methodical madness.</p>
            </div>

            <div class="about-card">
              <div class="card-icon">⚡</div>
              <h3>Our Approach</h3>
              <p>We combine cutting-edge technology with unconventional thinking. Every project gets the perfect blend of technical expertise and creative flair.</p>
            </div>

            <div class="about-card">
              <div class="card-icon">🎨</div>
              <h3>Our Style</h3>
              <p>Professional yet playful, serious yet fun. We create websites that perform flawlessly while making users smile. Because why choose between function and personality?</p>
            </div>
          </div>

          <section class="team-section">
            <h2>The RNDM Team</h2>
            <div class="team-grid">
              <div class="team-member">
                <div class="member-avatar">👨‍💻</div>
                <h4>William</h4>
                <p class="role">Lead Developer & Chaos Coordinator</p>
                <p>Full-stack developer with a passion for turning coffee into code and ideas into reality. Specializes in making the impossible look easy.</p>
              </div>

              <div class="team-member">
                <div class="member-avatar">🤖</div>
                <h4>AI Assistant</h4>
                <p class="role">Code Optimization & Quality Assurance</p>
                <p>Our digital team member that never sleeps, ensuring every line of code is optimized and every user experience is smooth.</p>
              </div>

              <div class="team-member">
                <div class="member-avatar">☕</div>
                <h4>Coffee</h4>
                <p class="role">Motivation & Energy Catalyst</p>
                <p>The unofficial third team member. Without coffee, there would be no RNDM Development. Essential for all late-night coding sessions.</p>
              </div>
            </div>
          </section>

          <section class="values-section">
            <h2>What We Believe</h2>
            <div class="values-list">
              <div class="value-item">
                <span class="value-icon">💡</span>
                <div>
                  <h4>Innovation First</h4>
                  <p>We don't just follow trends, we create them. Every project pushes boundaries.</p>
                </div>
              </div>
              
              <div class="value-item">
                <span class="value-icon">🎯</span>
                <div>
                  <h4>Quality Always</h4>
                  <p>Perfect code, flawless design, exceptional performance. We don't compromise.</p>
                </div>
              </div>
              
              <div class="value-item">
                <span class="value-icon">🤝</span>
                <div>
                  <h4>Client Partnership</h4>
                  <p>Your success is our success. We're not just developers, we're your digital allies.</p>
                </div>
              </div>
              
              <div class="value-item">
                <span class="value-icon">🌟</span>
                <div>
                  <h4>Fun in Function</h4>
                  <p>Great websites should be a joy to use and a pleasure to build.</p>
                </div>
              </div>
            </div>
          </section>

          <section class="cta-section">
            <h2>Ready to Build Something Amazing?</h2>
            <p>Let's turn your vision into digital reality. Whether it's a simple website or a complex web application, we're here to make it happen.</p>
            <div class="cta-buttons">
              <a href="#" class="btn" data-page="contact">Start Your Project</a>
              <a href="#" class="btn btn-secondary" data-page="account">Create Account</a>
            </div>
          </section>
        </div>
      </div>
    </div>
  `;
}

// Services page template
function renderServicesPage() {
  return `
    <div class="page-section active">
      <div class="container">
        <div class="services-header">
          <h1 class="section-title glitch">🌟 RNDM Development Services</h1>
          <p class="services-tagline">"Random ideas become remarkable solutions"</p>
          <div class="services-intro">
            <h2>🚀 Your Digital Dreams, Our Expertise</h2>
            <p>At RNDM, we turn your vision into reality. Whether you need a stunning website, a powerful mobile app, or complete digital transformation, we're here to make it happen. No project is too big, too small, or too "random" for our team.</p>
          </div>
        </div>

        <section class="services-why-choose">
          <h3>✨ Why Choose RNDM?</h3>
          <div class="why-choose-grid">
            <div class="why-choose-card">
              <div class="card-icon">🎯</div>
              <h4>Tailored Solutions</h4>
              <p>Every project is unique, just like your business</p>
            </div>
            <div class="why-choose-card">
              <div class="card-icon">💡</div>
              <h4>Innovation First</h4>
              <p>We love bringing creative ideas to life</p>
            </div>
            <div class="why-choose-card">
              <div class="card-icon">🤝</div>
              <h4>Partnership Approach</h4>
              <p>We're not just developers, we're your digital partners</p>
            </div>
            <div class="why-choose-card">
              <div class="card-icon">⚡</div>
              <h4>Fast & Reliable</h4>
              <p>Quality work delivered on time, every time</p>
            </div>
          </div>
        </section>

        <section class="website-services">
          <h2>💻 Website Development Solutions</h2>
          
          <div class="package-includes">
            <h3>🌟 What Every Package Includes</h3>
            <div class="includes-grid">
              <div class="include-item">✅ Complete Customization - Your vision, brought to life exactly as you imagine</div>
              <div class="include-item">✅ Lifetime Support - We're here for you long after launch (monthly maintenance starting at $10)</div>
              <div class="include-item">✅ Full Flexibility - Changes and updates whenever you need them</div>
              <div class="include-item">✅ Domain & Hosting - We handle all the technical setup for you</div>
              <div class="include-item">✅ Mobile-First Design - Looks perfect on every device</div>
              <div class="include-item">✅ Search Engine Ready - Built with SEO best practices from day one</div>
              <div class="include-item">✅ Security Included - SSL certificates and security measures included</div>
              <div class="include-item">✅ Performance Optimized - Fast loading times guaranteed</div>
            </div>
          </div>

          <div class="track-record">
            <h3>🏆 Our Track Record</h3>
            <div class="track-grid">
              <div class="track-item">
                <div class="track-icon">✅</div>
                <h4>100% Client Satisfaction</h4>
                <p>We don't stop until you're thrilled</p>
              </div>
              <div class="track-item">
                <div class="track-icon">✅</div>
                <h4>On-Time Delivery</h4>
                <p>We respect your deadlines</p>
              </div>
              <div class="track-item">
                <div class="track-icon">✅</div>
                <h4>No Hidden Fees</h4>
                <p>Transparent pricing, always</p>
              </div>
              <div class="track-item">
                <div class="track-icon">✅</div>
                <h4>Ongoing Support</h4>
                <p>We're partners for the long haul</p>
              </div>
            </div>
          </div>

          <div class="service-tiers">
            <div class="service-tier">
              <div class="tier-header">
                <h3>🚀 Starter Website</h3>
                <p class="tier-subtitle">Perfect for Getting Online Fast</p>
              </div>
              <div class="tier-ideal">
                <strong>Ideal for:</strong> Personal portfolios, small projects, getting your first web presence
              </div>
              <div class="tier-price">FREE initial setup</div>
              <div class="tier-timeline">Timeline: 1-2 business days</div>
              <div class="tier-features">
                <h4>What You Get:</h4>
                <ul>
                  <li>Professional landing page with your branding</li>
                  <li>Essential pages: Home, About, Contact</li>
                  <li>Mobile-responsive design</li>
                  <li>Basic SEO optimization</li>
                </ul>
              </div>
            </div>

            <div class="service-tier featured">
              <div class="tier-header">
                <h3>💼 Professional Website</h3>
                <p class="tier-subtitle">Built for Business Growth</p>
              </div>
              <div class="tier-ideal">
                <strong>Ideal for:</strong> Small businesses, service providers, local companies
              </div>
              <div class="tier-price">Starting at $35</div>
              <div class="tier-timeline">Timeline: 2-4 business days</div>
              <div class="tier-features">
                <h4>What You Get:</h4>
                <ul>
                  <li>Multi-page professional website</li>
                  <li>Custom contact forms and business features</li>
                  <li>Enhanced SEO and performance optimization</li>
                  <li>Social media integration</li>
                  <li>Basic analytics setup</li>
                </ul>
              </div>
            </div>

            <div class="service-tier">
              <div class="tier-header">
                <h3>🏢 Enterprise Website</h3>
                <p class="tier-subtitle">Complete Digital Solutions</p>
              </div>
              <div class="tier-ideal">
                <strong>Ideal for:</strong> Established businesses, complex requirements, e-commerce
              </div>
              <div class="tier-price">Starting at $100</div>
              <div class="tier-timeline">Timeline: Varies based on complexity (we'll provide detailed timeline)</div>
              <div class="tier-features">
                <h4>What You Get:</h4>
                <ul>
                  <li>Fully custom design and functionality</li>
                  <li>Advanced features (e-commerce, user accounts, etc.)</li>
                  <li>Premium performance optimization</li>
                  <li>Advanced analytics and reporting</li>
                  <li>Priority support and faster updates</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section class="mobile-services">
          <h2>📱 Mobile App Development</h2>
          
          <div class="android-specialists">
            <h3>🤖 Android Specialists</h3>
            <p>We focus exclusively on Android development to deliver the highest quality apps for your needs. You'll receive the complete app files for easy publishing to Google Play Store.</p>
            <p><strong>Why Android?</strong> By specializing in Android, we can deliver superior quality and faster development times. Android represents over 70% of the global mobile market, ensuring your app reaches the widest possible audience.</p>
          </div>

          <div class="app-tiers">
            <div class="service-tier">
              <div class="tier-header">
                <h3>📲 Personal Apps</h3>
                <p class="tier-subtitle">Just for You</p>
              </div>
              <div class="tier-ideal">
                <strong>Perfect for:</strong> Personal use, family apps, private tools
              </div>
              <div class="tier-price">Starting at $20</div>
              <div class="tier-timeline">Updates: Only $5 per update request</div>
              <div class="tier-features">
                <h4>Features:</h4>
                <ul>
                  <li>Custom functionality tailored to your needs</li>
                  <li>No app store requirements - direct installation</li>
                  <li>Quick development and delivery</li>
                  <li>Simple, intuitive design</li>
                </ul>
              </div>
            </div>

            <div class="service-tier">
              <div class="tier-header">
                <h3>👥 Team Apps</h3>
                <p class="tier-subtitle">Small Group Solutions</p>
              </div>
              <div class="tier-ideal">
                <strong>Perfect for:</strong> Small teams, private communities, limited user groups
              </div>
              <div class="tier-price">Starting at $50</div>
              <div class="tier-timeline">Timeline: Quick development for standard features</div>
              <div class="tier-features">
                <h4>Features:</h4>
                <ul>
                  <li>Multi-user functionality</li>
                  <li>Real-time messaging and collaboration</li>
                  <li>User management and permissions</li>
                  <li>Can be distributed privately or through app stores</li>
                </ul>
              </div>
            </div>

            <div class="service-tier">
              <div class="tier-header">
                <h3>🚀 Professional Apps</h3>
                <p class="tier-subtitle">Full-Scale Solutions</p>
              </div>
              <div class="tier-ideal">
                <strong>Perfect for:</strong> Business applications, public release, complex requirements
              </div>
              <div class="tier-price">Starting at $100</div>
              <div class="tier-timeline">Timeline: Varies based on complexity (detailed timeline provided)</div>
              <div class="tier-features">
                <h4>Features:</h4>
                <ul>
                  <li>Advanced functionality and integrations</li>
                  <li>Scalable architecture for growth</li>
                  <li>Professional UI/UX design</li>
                  <li>Full Google Play Store optimization</li>
                  <li>Comprehensive testing and quality assurance</li>
                </ul>
              </div>
              <div class="tier-note">
                <p><strong>Note:</strong> We'll honestly assess if we're the right fit for your specific needs</p>
              </div>
            </div>
          </div>
        </section>

        <section class="business-solutions">
          <h2>🏆 Complete Business Solutions</h2>
          <div class="business-tier">
            <div class="tier-header">
              <h3>💎 Full-Service Partnership</h3>
              <p class="tier-subtitle">Everything You Need</p>
            </div>
            <div class="tier-ideal">
              <strong>Perfect for:</strong> Growing businesses that need comprehensive digital solutions
            </div>
            <div class="tier-price">Starting at $100/month</div>
            <div class="tier-commitment">Commitment: Month-to-month flexibility</div>
            <div class="tier-features">
              <h4>What's Included:</h4>
              <ul>
                <li>Website AND Mobile App (when needed)</li>
                <li>Priority Development - Your projects come first</li>
                <li>Direct Developer Access - Skip the middleman</li>
                <li>Unlimited Updates - No extra fees for changes</li>
                <li>24/7 Support - We're here when you need us</li>
                <li>Monthly Strategy Sessions - Keep your digital presence competitive</li>
              </ul>
            </div>
            <div class="tier-savings">
              <h4>What You Save:</h4>
              <p>No setup fees, no update charges, no surprise costs</p>
            </div>
            <div class="business-quote">
              <p><em>"Think of us as your in-house development team, without the overhead."</em></p>
            </div>
          </div>
        </section>

        <section class="cta-section">
          <h2>🎯 Ready to Get Started?</h2>
          <p>Every great project starts with a conversation. We'd love to hear about your ideas, challenges, and goals.</p>
          
          <div class="cta-grid">
            <div class="cta-card">
              <h3>📞 Get In Touch</h3>
              <ul>
                <li>Quick Response - We typically respond within 24 hours</li>
                <li>Free Consultation - No obligation, just honest advice</li>
                <li>Clear Communication - We speak your language, not just tech jargon</li>
                <li>Flexible Meeting Options - Phone, video call, or email - whatever works for you</li>
              </ul>
            </div>
            
            <div class="cta-card">
              <h3>🎁 Special Offers</h3>
              <ul>
                <li>First-Time Clients - Free consultation and project planning session</li>
                <li>Students & Nonprofits - Ask about our special pricing</li>
                <li>Referral Program - Earn credits for bringing us new clients</li>
              </ul>
            </div>
          </div>

          <div class="cta-process">
            <h3>🔒 What You Can Expect</h3>
            <div class="process-steps">
              <div class="process-step">
                <div class="step-number">1</div>
                <h4>Discovery Call</h4>
                <p>We'll discuss your needs and vision</p>
              </div>
              <div class="process-step">
                <div class="step-number">2</div>
                <h4>Proposal & Timeline</h4>
                <p>Clear scope, pricing, and delivery dates</p>
              </div>
              <div class="process-step">
                <div class="step-number">3</div>
                <h4>Regular Updates</h4>
                <p>Stay informed throughout development</p>
              </div>
              <div class="process-step">
                <div class="step-number">4</div>
                <h4>Launch & Support</h4>
                <p>We don't disappear after delivery</p>
              </div>
            </div>
          </div>

          <div class="cta-buttons">
            <a href="#" class="btn" data-page="contact">Start Your Project</a>
            <a href="#" class="btn btn-secondary" data-page="about">Learn More About Us</a>
          </div>
          
          <div class="cta-quote">
            <p><em>"Your success is our success. Let's build something amazing together."</em></p>
          </div>
        </section>
      </div>
    </div>
  `;
}

// Contact page template
function renderContactPage() {
  // Check if user is logged in
  if (!appState.isUserLoggedIn) {
    return `
      <div class="page-section active">
        <div class="container">
          <h1 class="section-title">Contact RNDM DEVS</h1>
          <div class="auth-required-section">
            <div class="auth-message">
              <h3>🔐 Account Required</h3>
              <p>To submit a project inquiry and track your requests, please create an account or sign in first.</p>
              <div class="auth-actions">
                <button class="btn btn-primary" onclick="navigateToPage('account')">Sign In / Create Account</button>
              </div>
              <div class="benefits-list">
                <h4>Benefits of creating an account:</h4>
                <ul>
                  <li>✅ Track all your project submissions</li>
                  <li>✅ View project status and updates</li>
                  <li>✅ Access your project history</li>
                  <li>✅ Faster future submissions</li>
                  <li>✅ Direct communication with our team</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="page-section active">
      <div class="container">
        <h1 class="section-title">Contact RNDM DEVS</h1>
        <div class="user-welcome">
          <p>Welcome, <strong>${appState.userProfile?.firstName || 'User'}</strong>! Submit your project inquiry below.</p>
        </div>
        <div class="contact-section">
          <form class="contact-form" id="contactForm">
            <div class="user-info-display">
              <p><strong>Submitting as:</strong> ${appState.userProfile?.firstName} ${appState.userProfile?.lastName} (${appState.userProfile?.email})</p>
            </div>
            
            <div class="form-group">
              <label for="company">Company/Organization</label>
              <input type="text" id="company" name="company" value="${appState.userProfile?.company || ''}" placeholder="Enter your company name">
            </div>
            
            <div class="form-group">
              <label for="project">Project Type *</label>
              <select id="project" name="project" required>
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
              <label for="timeline">Timeline</label>
              <select id="timeline" name="timeline">
                <option value="">Select timeline</option>
                <option value="asap">ASAP</option>
                <option value="1-month">Within 1 month</option>
                <option value="2-3-months">2-3 months</option>
                <option value="flexible">Flexible</option>
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

// Account page template
function renderAccountPage() {
  if (!appState.isUserLoggedIn) {
    return `
      <div class="page-section active">
        <div class="container">
          <h1 class="section-title">Your Account</h1>
          
          <div class="account-container">
            <div class="auth-tabs">
              <button class="auth-tab active" data-tab="login">Sign In</button>
              <button class="auth-tab" data-tab="register">Create Account</button>
            </div>

            <!-- Login Form -->
            <div class="auth-form" id="loginForm">
              <h2>Welcome Back!</h2>
              <p style="color: var(--text-gray); margin-bottom: 2rem;">
                Sign in to access your project dashboard and account settings.
              </p>
              
              <form id="userLoginForm">
                <div class="form-group">
                  <label for="userEmail">Email Address</label>
                  <input type="email" id="userEmail" name="email" required placeholder="your@email.com">
                </div>
                
                <div class="form-group">
                  <label for="userPassword">Password</label>
                  <input type="password" id="userPassword" name="password" required placeholder="Your password">
                </div>
                
                <div class="form-options">
                  <label class="checkbox-label">
                    <input type="checkbox" id="rememberMe">
                    <span class="checkmark"></span>
                    Remember me
                  </label>
                  <a href="#" class="forgot-link" onclick="showForgotPassword()">Forgot password?</a>
                </div>
                
                <button type="submit" class="btn" style="width: 100%; margin-top: 1rem;">
                  Sign In
                </button>
              </form>
              
              <div class="auth-divider">
                <span>or</span>
              </div>
              
              <button class="btn btn-secondary" style="width: 100%;" onclick="signInWithGoogle()">
                🔐 Sign in with Google
              </button>
            </div>

            <!-- Registration Form -->
            <div class="auth-form" id="registerForm" style="display: none;">
              <h2>Join RNDM Development</h2>
              <p style="color: var(--text-gray); margin-bottom: 2rem;">
                Create your account to track projects, save preferences, and get exclusive updates.
              </p>
              
              <form id="userRegisterForm">
                <div class="form-row">
                  <div class="form-group">
                    <label for="firstName">First Name</label>
                    <input type="text" id="firstName" name="firstName" required placeholder="John">
                  </div>
                  <div class="form-group">
                    <label for="lastName">Last Name</label>
                    <input type="text" id="lastName" name="lastName" required placeholder="Doe">
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="regEmail">Email Address</label>
                  <input type="email" id="regEmail" name="email" required placeholder="your@email.com">
                </div>
                
                <div class="form-group">
                  <label for="regPassword">Password</label>
                  <input type="password" id="regPassword" name="password" required placeholder="Minimum 8 characters">
                  <small class="field-hint">Must be at least 8 characters with letters and numbers</small>
                </div>
                
                <div class="form-group">
                  <label for="confirmPassword">Confirm Password</label>
                  <input type="password" id="confirmPassword" name="confirmPassword" required placeholder="Confirm your password">
                </div>
                
                <div class="form-group">
                  <label for="company">Company/Organization (Optional)</label>
                  <input type="text" id="company" name="company" placeholder="Your company name">
                </div>
                
                <div class="form-options">
                  <label class="checkbox-label">
                    <input type="checkbox" id="agreeTerms" required>
                    <span class="checkmark"></span>
                    I agree to the <a href="./terms-of-service.html" target="_blank" rel="noopener noreferrer" class="link">Terms of Service</a> and <a href="./privacy-policy.html" target="_blank" rel="noopener noreferrer" class="link">Privacy Policy</a>
                  </label>
                </div>
                
                <div class="form-options">
                  <label class="checkbox-label">
                    <input type="checkbox" id="marketingEmails">
                    <span class="checkmark"></span>
                    Send me updates about new services and features
                  </label>
                </div>
                
                <button type="submit" class="btn" style="width: 100%; margin-top: 1rem;">
                  Create Account
                </button>
              </form>
              
              <div class="auth-divider">
                <span>or</span>
              </div>
              
              <button class="btn btn-secondary" style="width: 100%;" onclick="signUpWithGoogle()">
                🔐 Sign up with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  // User is logged in - show dashboard
  console.log('Rendering dashboard - User profile:', appState.userProfile);
  console.log('Rendering dashboard - Current user:', appState.currentUser);
  
  return `
    <div class="page-section active">
      <div class="container">
        <h1 class="section-title">Account Dashboard</h1>
        
        <div class="dashboard-header">
          <div class="user-welcome">
            <div class="user-avatar">
              ${appState.userProfile?.photoURL ? 
                `<img src="${appState.userProfile.photoURL}" alt="Profile" class="avatar-img">` : 
                '<div class="avatar-placeholder">👤</div>'
              }
            </div>
            <div class="user-info">
              <h2>Welcome back, ${appState.userProfile?.firstName ? `${appState.userProfile.firstName} ${appState.userProfile.lastName || ''}`.trim() : appState.userProfile?.displayName || 'User'}!</h2>
              <p class="user-email">${appState.userProfile?.email || appState.currentUser?.email || 'No email'}</p>
              <p class="user-company">${appState.userProfile?.company ? `Company: ${appState.userProfile.company}` : ''}</p>
              <p class="member-since">Member since ${appState.currentUser?.metadata?.creationTime ? new Date(appState.currentUser.metadata.creationTime).toLocaleDateString() : 'recently'}</p>
            </div>
          </div>
          <div class="dashboard-actions">
            <button class="btn btn-secondary" onclick="editProfile()">Edit Profile</button>
            <button class="btn btn-secondary" onclick="handleUserSignOut()">Sign Out</button>
          </div>
        </div>

        <div class="dashboard-content">
          <div class="dashboard-grid">
            <!-- Project Overview -->
            <div class="dashboard-card">
              <div class="card-header">
                <h3>📊 Project Overview</h3>
              </div>
              <div class="card-content">
                <div class="stat-row">
                  <span class="stat-label">Active Projects:</span>
                  <span class="stat-value" id="activeProjects">0</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Completed Projects:</span>
                  <span class="stat-value" id="completedProjects">0</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Total Inquiries:</span>
                  <span class="stat-value" id="totalInquiries">0</span>
                </div>
                <button class="btn btn-primary" style="margin-top: 1rem; width: 100%;" data-page="contact">
                  Start New Project
                </button>
              </div>
            </div>

            <!-- Recent Activity -->
            <div class="dashboard-card">
              <div class="card-header">
                <h3>📋 Recent Activity</h3>
              </div>
              <div class="card-content">
                <div id="recentActivity">
                  <div class="activity-item">
                    <div class="activity-icon">📝</div>
                    <div class="activity-details">
                      <p class="activity-title">Welcome to RNDM Development!</p>
                      <p class="activity-time">Account created</p>
                    </div>
                  </div>
                </div>
                <button class="btn btn-secondary" style="margin-top: 1rem; width: 100%;" onclick="viewAllActivity()">
                  View All Activity
                </button>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="dashboard-card">
              <div class="card-header">
                <h3>⚡ Quick Actions</h3>
              </div>
              <div class="card-content">
                <div class="quick-actions">
                  <button class="quick-action-btn" data-page="contact">
                    <div class="action-icon">✉️</div>
                    <span>New Inquiry</span>
                  </button>
                  <button class="quick-action-btn" onclick="viewProjects()">
                    <div class="action-icon">📁</div>
                    <span>My Projects</span>
                  </button>
                  <button class="quick-action-btn" onclick="downloadInvoices()">
                    <div class="action-icon">💰</div>
                    <span>Invoices</span>
                  </button>
                  <button class="quick-action-btn" onclick="contactSupport()">
                    <div class="action-icon">🆘</div>
                    <span>Support</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Account Settings -->
            <div class="dashboard-card">
              <div class="card-header">
                <h3>⚙️ Account Settings</h3>
              </div>
              <div class="card-content">
                <div class="settings-list">
                  <button class="setting-item" onclick="editProfile()">
                    <span class="setting-icon">👤</span>
                    <span class="setting-label">Profile Information</span>
                    <span class="setting-arrow">→</span>
                  </button>
                  <button class="setting-item" onclick="changePassword()">
                    <span class="setting-icon">🔒</span>
                    <span class="setting-label">Password & Security</span>
                    <span class="setting-arrow">→</span>
                  </button>
                  <button class="setting-item" onclick="notificationSettings()">
                    <span class="setting-icon">🔔</span>
                    <span class="setting-label">Notifications</span>
                    <span class="setting-arrow">→</span>
                  </button>
                  <button class="setting-item" onclick="billingSettings()">
                    <span class="setting-icon">💳</span>
                    <span class="setting-label">Billing & Payments</span>
                    <span class="setting-arrow">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Edit Modal -->
    <div id="profileModal" class="modal" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Edit Profile</h3>
          <button class="modal-close" onclick="closeProfileModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="profileEditForm">
            <div class="form-row">
              <div class="form-group">
                <label for="editFirstName">First Name</label>
                <input type="text" id="editFirstName" name="editFirstName" required>
              </div>
              <div class="form-group">
                <label for="editLastName">Last Name</label>
                <input type="text" id="editLastName" name="editLastName" required>
              </div>
            </div>
            <div class="form-group">
              <label for="editUserEmail">Email</label>
              <input type="email" id="editUserEmail" name="editUserEmail" required>
            </div>
            <div class="form-group">
              <label for="editUserCompany">Company</label>
              <input type="text" id="editUserCompany" name="editUserCompany">
            </div>
            <div class="form-group">
              <label for="editPhone">Phone Number</label>
              <input type="tel" id="editPhone" name="editPhone">
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" onclick="closeProfileModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Support Modal -->
    <div id="supportModal" class="modal" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Contact Support</h3>
          <button class="modal-close" onclick="closeSupportModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="support-intro">
            <p>Need help? We're here to assist you with any questions or issues.</p>
          </div>
          
          <form id="supportForm">
            <div class="form-group">
              <label for="supportType">Support Type *</label>
              <select id="supportType" name="supportType" required>
                <option value="">Select support type</option>
                <option value="account">Account Issues</option>
                <option value="project-status">Project Status Inquiry</option>
                <option value="billing">Billing & Payments</option>
                <option value="technical">Technical Support</option>
                <option value="feature-request">Feature Request</option>
                <option value="bug-report">Bug Report</option>
                <option value="general">General Question</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label for="supportPriority">Priority Level</label>
              <select id="supportPriority" name="supportPriority">
                <option value="low">Low - General inquiry</option>
                <option value="medium" selected>Medium - Standard support</option>
                <option value="high">High - Urgent issue</option>
                <option value="critical">Critical - System down</option>
              </select>
            </div>

            <div class="form-group" id="projectReferenceGroup" style="display: none;">
              <label for="projectReference">Related Project</label>
              <select id="projectReference" name="projectReference">
                <option value="">Select a project (optional)</option>
              </select>
              <small class="field-hint">Choose the project this support request relates to</small>
            </div>

            <div class="form-group">
              <label for="supportSubject">Subject *</label>
              <input type="text" id="supportSubject" name="supportSubject" required placeholder="Brief description of your issue or question">
            </div>
            
            <div class="form-group">
              <label for="supportMessage">Detailed Description *</label>
              <textarea id="supportMessage" name="supportMessage" required rows="5" placeholder="Please provide as much detail as possible about your issue, including:&#10;- What you were trying to do&#10;- What happened instead&#10;- Any error messages&#10;- Steps to reproduce (if applicable)"></textarea>
            </div>

            <div class="form-group">
              <label for="contactMethod">Preferred Contact Method</label>
              <select id="contactMethod" name="contactMethod">
                <option value="email">Email (default)</option>
                <option value="phone">Phone Call</option>
                <option value="video">Video Call</option>
              </select>
            </div>

            <div class="support-info">
              <div class="info-section">
                <h4>📧 Current Contact Info:</h4>
                <p><strong>Name:</strong> ${appState.userProfile?.firstName} ${appState.userProfile?.lastName}</p>
                <p><strong>Email:</strong> ${appState.userProfile?.email}</p>
                <p><strong>Company:</strong> ${appState.userProfile?.company || 'Not specified'}</p>
              </div>
              
              <div class="info-section">
                <h4>⏱️ Response Times:</h4>
                <ul>
                  <li><strong>Critical:</strong> Within 1 hour</li>
                  <li><strong>High:</strong> Within 4 hours</li>
                  <li><strong>Medium:</strong> Within 24 hours</li>
                  <li><strong>Low:</strong> Within 2-3 business days</li>
                </ul>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" onclick="closeSupportModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">Submit Support Request</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Admin page template
function renderAdminPage() {
  // Check if user is logged in but not an admin
  if (appState.currentUser && !appState.isAdminLoggedIn) {
    return `
      <div class="page-section active">
        <div class="container">
          <div class="admin-access-denied">
            <div class="access-denied-content">
              <div class="icon">🚫</div>
              <h2>Access Denied</h2>
              <p>Your account (${appState.currentUser.email}) does not have administrator privileges.</p>
              <p>Only authorized personnel can access the admin dashboard.</p>
              
              <div class="access-actions">
                <button class="btn btn-secondary" onclick="navigateToPage('account')">
                  ← Return to Account
                </button>
                <button class="btn btn-primary" onclick="firebaseService.signOutUser().then(() => navigateToPage('admin'))">
                  Sign In as Admin
                </button>
              </div>
              
              <div class="admin-contact">
                <p style="margin-top: 2rem; font-size: 0.9rem; color: var(--text-gray);">
                  Need admin access? Contact your system administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  if (!appState.isAdminLoggedIn) {
    return `
      <div class="page-section active">
        <div class="container">
          <div class="admin-login">
            <h2>Admin Access</h2>
            <p style="margin-bottom: 2rem; color: var(--text-gray);">
              Sign in with your administrator credentials
            </p>
            
            <form id="adminAuthForm">
              <div class="form-group">
                <label for="adminEmail">Email</label>
                <input type="email" id="adminEmail" placeholder="Admin Email" required style="width: 100%; padding: 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid var(--border-color); border-radius: 5px; color: var(--text-light); font-size: 1rem;">
              </div>
              <div class="form-group">
                <label for="adminPassword">Password</label>
                <input type="password" id="adminPassword" placeholder="Password" required style="width: 100%; padding: 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid var(--border-color); border-radius: 5px; color: var(--text-light); font-size: 1rem;">
              </div>
              <button type="submit" class="btn" style="width: 100%;">
                Sign In as Admin
              </button>
            </form>
            
            <div style="margin-top: 2rem; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 5px; border: 1px solid var(--border-color);">
              <p style="color: var(--text-gray); font-size: 0.9rem; margin: 0; text-align: center;">
                🔒 Authorized personnel only - Access is restricted to approved email addresses
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
        <div class="admin-header">
          <h1 class="section-title">Admin Dashboard</h1>
          <div class="admin-header-controls">
            <span class="admin-user-info">Welcome, ${appState.currentUser?.email || 'Admin'}</span>
            <button class="btn btn-icon" onclick="toggleDarkMode()" title="Toggle Dark Mode">🌙</button>
            <button class="btn btn-secondary" onclick="handleSignOut()">Sign Out</button>
          </div>
        </div>

        <!-- Admin Navigation Tabs -->
        <div class="admin-tabs">
          <button class="admin-tab active" onclick="switchAdminTab('welcome')" data-tab="welcome">
            <span class="tab-icon">🏠</span>
            <span class="tab-label">Welcome</span>
          </button>
          <button class="admin-tab" onclick="switchAdminTab('forms')" data-tab="forms">
            <span class="tab-icon">📋</span>
            <span class="tab-label">Projects</span>
          </button>
          <button class="admin-tab" onclick="switchAdminTab('support')" data-tab="support">
            <span class="tab-icon">🎧</span>
            <span class="tab-label">Support</span>
          </button>
          <button class="admin-tab" onclick="switchAdminTab('users')" data-tab="users">
            <span class="tab-icon">👥</span>
            <span class="tab-label">Users</span>
          </button>
          <button class="admin-tab" onclick="switchAdminTab('metrics')" data-tab="metrics">
            <span class="tab-icon">📊</span>
            <span class="tab-label">Metrics</span>
          </button>
        </div>

        <!-- Tab Content -->
        <div class="admin-tab-content">
          
          <!-- Welcome Tab -->
          <div id="welcomeTab" class="tab-panel active">
            <div class="welcome-section">
              <div class="welcome-card">
                <h2>Welcome to RNDM Development Admin</h2>
                <p>Your central hub for managing projects, users, and business metrics.</p>
                
                <div class="quick-stats">
                  <div class="quick-stat">
                    <div class="stat-icon">�</div>
                    <div class="stat-info">
                      <h3 id="quickTotalSubmissions">0</h3>
                      <p>Total Submissions</p>
                    </div>
                  </div>
                  <div class="quick-stat">
                    <div class="stat-icon">�</div>
                    <div class="stat-info">
                      <h3 id="quickTotalUsers">0</h3>
                      <p>Registered Users</p>
                    </div>
                  </div>
                  <div class="quick-stat">
                    <div class="stat-icon">�</div>
                    <div class="stat-info">
                      <h3 id="quickActiveProjects">0</h3>
                      <p>Active Projects</p>
                    </div>
                  </div>
                </div>

                <div class="quick-actions">
                  <h3>Quick Actions</h3>
                  <div class="action-buttons">
                    <button class="btn btn-primary" onclick="switchAdminTab('forms')">
                      📋 View Contact Forms
                    </button>
                    <button class="btn btn-primary" onclick="switchAdminTab('users')">
                      👥 Manage Users
                    </button>
                    <button class="btn btn-primary" onclick="switchAdminTab('metrics')">
                      📊 View Analytics
                    </button>
                  </div>
                </div>

                <div class="recent-activity">
                  <h3>Recent Activity</h3>
                  <div id="recentActivityList">
                    <div class="loading">Loading recent activity...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Forms Tab -->
          <div id="formsTab" class="tab-panel">
            <div class="forms-section">
              <h2>Contact Form Submissions</h2>
              
              <!-- Controls Section -->
              <div class="admin-controls">
                <div class="controls-header">
                  <div class="controls-left">
                    <h3 style="color: var(--primary-color); margin: 0;">Manage Submissions</h3>
                  </div>
                  <div class="controls-right">
                    <button class="btn btn-secondary" onclick="testEmailNotification()" title="Test Email">📧 Test Email</button>
                    <button class="btn btn-secondary" onclick="exportData('csv')">📋 Export CSV</button>
                    <button class="btn btn-secondary" onclick="exportData('json')">📄 Export JSON</button>
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

          <!-- Support Tab -->
          <div id="supportTab" class="tab-panel">
            <div class="support-section">
              <h2>Support Tickets</h2>
              
              <!-- Controls Section -->
              <div class="admin-controls">
                <div class="controls-header">
                  <div class="controls-left">
                    <h3 style="color: var(--primary-color); margin: 0;">Manage Support Tickets</h3>
                  </div>
                  <div class="controls-right">
                    <button class="btn btn-secondary" onclick="exportSupportData('csv')">📋 Export CSV</button>
                    <button class="btn btn-secondary" onclick="exportSupportData('json')">📄 Export JSON</button>
                  </div>
                </div>

                <!-- Search and Filter Controls -->
                <div class="filter-controls">
                  <div class="filter-row">
                    <input type="text" id="supportSearchFilter" placeholder="Search by name, email, ticket ID..." class="filter-input">
                    <select id="supportTypeFilter" class="filter-select">
                      <option value="">All Support Types</option>
                      <option value="account-issues">Account Issues</option>
                      <option value="project-status">Project Status</option>
                      <option value="billing">Billing</option>
                      <option value="technical-support">Technical Support</option>
                      <option value="feature-request">Feature Request</option>
                      <option value="bug-report">Bug Report</option>
                    </select>
                    <select id="priorityFilter" class="filter-select">
                      <option value="">All Priorities</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <select id="supportStatusFilter" class="filter-select">
                      <option value="">All Status</option>
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div class="filter-row">
                    <input type="date" id="supportDateFrom" class="filter-input" title="From Date">
                    <input type="date" id="supportDateTo" class="filter-input" title="To Date">
                    <button class="btn btn-primary" onclick="applySupportFilters()">🔍 Apply Filters</button>
                    <button class="btn btn-secondary" onclick="clearSupportFilters()">Clear</button>
                  </div>
                </div>
              </div>

              <!-- Support Tickets Container -->
              <div id="supportTicketsContainer">
                <div class="loading">
                  <div class="loading-spinner"></div>
                  <p>Loading support tickets...</p>
                </div>
              </div>

              <!-- Notification Badge for New Tickets -->
              <div id="newTicketBadge" class="notification-badge" style="display: none;">
                <span id="newTicketCount">0</span> new ticket(s)
              </div>
            </div>
          </div>

          <!-- Users Tab -->
          <div id="usersTab" class="tab-panel">
            <div class="users-section">
              <h2>User Management</h2>
              <div id="usersContainer">
                <div class="loading">Loading users...</div>
              </div>
            </div>
          </div>

          <!-- Metrics Tab -->
          <div id="metricsTab" class="tab-panel">
            <div class="metrics-section">
              <h2>Business Analytics</h2>
              <div id="metricsContainer">
                <div class="loading">Loading metrics...</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div id="editModal" class="modal" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="editModalTitle">Edit</h3>
          <button class="modal-close" onclick="closeEditModal()">&times;</button>
        </div>
        <div class="modal-body" id="editModalBody">
          <!-- Content will be dynamically populated -->
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

  // Make admin tab switching globally available
  window.switchAdminTab = switchAdminTab;
}

// Admin Tab Management
function switchAdminTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
  activeTab.classList.add('active');
  
  // Scroll active tab into view on mobile
  if (window.innerWidth <= 768) {
    activeTab.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest',
      inline: 'center'
    });
  }
  
  // Update tab panels
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  document.getElementById(`${tabName}Tab`).classList.add('active');
  
  // Load content based on tab
  switch(tabName) {
    case 'welcome':
      loadWelcomeContent();
      break;
    case 'forms':
      loadFormsContent();
      break;
    case 'support':
      loadSupportContent();
      break;
    case 'users':
      loadUsersContent();
      break;
    case 'metrics':
      loadMetricsContent();
      break;
  }
}

// Enhance admin tabs for mobile experience
function enhanceAdminTabsForMobile() {
  const adminTabs = document.querySelector('.admin-tabs');
  if (!adminTabs) return;
  
  // Add touch-friendly enhancements
  let isScrolling = false;
  
  adminTabs.addEventListener('scroll', () => {
    if (!isScrolling) {
      // Add visual feedback during scroll
      adminTabs.style.boxShadow = 'inset 0 0 0 2px rgba(0, 255, 255, 0.3)';
      isScrolling = true;
      
      setTimeout(() => {
        adminTabs.style.boxShadow = '';
        isScrolling = false;
      }, 300);
    }
  });
  
  // Add momentum scrolling for better mobile experience
  adminTabs.style.webkitOverflowScrolling = 'touch';
  
  // Check if tabs are scrollable and add visual hint
  if (adminTabs.scrollWidth > adminTabs.clientWidth) {
    adminTabs.classList.add('scrollable');
    
    // Add a subtle animation hint on page load
    setTimeout(() => {
      adminTabs.scrollLeft = 20;
      setTimeout(() => {
        adminTabs.scrollTo({ left: 0, behavior: 'smooth' });
      }, 500);
    }, 1000);
  }
}

// Welcome Tab Content
function loadWelcomeContent() {
  // Load quick stats
  loadQuickStats();
  loadRecentActivity();
}

function loadQuickStats() {
  // Load submissions count
  firebaseService.getAllSubmissions().then(result => {
    if (result.success) {
      document.getElementById('quickTotalSubmissions').textContent = result.submissions.length;
      
      // Count active projects (new or in-progress)
      const activeProjects = result.submissions.filter(s => 
        s.status === 'new' || s.status === 'in-progress'
      ).length;
      document.getElementById('quickActiveProjects').textContent = activeProjects;
    }
  });
  
  // Load users count (placeholder for now)
  firebaseService.getAllUsers().then(result => {
    if (result.success) {
      document.getElementById('quickTotalUsers').textContent = result.users.length;
    }
  }).catch(() => {
    // If getAllUsers doesn't exist yet, show placeholder
    document.getElementById('quickTotalUsers').textContent = '-';
  });
}

function loadRecentActivity() {
  const container = document.getElementById('recentActivityList');
  
  firebaseService.getAllSubmissions().then(result => {
    if (result.success && result.submissions.length > 0) {
      // Get last 5 submissions
      const recent = result.submissions
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);
      
      container.innerHTML = recent.map(submission => `
        <div class="activity-item">
          <div class="activity-icon">📋</div>
          <div class="activity-details">
            <p><strong>${submission.name}</strong> submitted a ${getProjectDisplayText(submission.project)} inquiry</p>
            <small>${new Date(submission.timestamp).toLocaleDateString()}</small>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p>No recent activity</p>';
    }
  });
}

// Forms Tab Content
function loadFormsContent() {
  // This loads the existing submissions functionality
  loadAdminData();
}

// Support Tab Content
function loadSupportContent() {
  loadSupportTickets();
}

// Load admin data (alias for loadContactSubmissions for compatibility)
function loadAdminData() {
  loadContactSubmissions();
}

// Users Tab Content  
function loadUsersContent() {
  const container = document.getElementById('usersContainer');
  container.innerHTML = `
    <div class="users-section">
      <div class="users-header">
        <h3>Registered Users</h3>
        <button class="btn btn-primary" onclick="refreshUsersData()">🔄 Refresh</button>
      </div>
      
      <div class="users-grid" id="usersGrid">
        <div class="loading">Loading user data...</div>
      </div>
    </div>
  `;
  
  // Load actual users data
  loadUsersData();
}

function loadUsersData() {
  const grid = document.getElementById('usersGrid');
  
  // For now, we'll get user info from submissions until we implement getAllUsers
  firebaseService.getAllSubmissions().then(result => {
    if (result.success) {
      // Group submissions by user
      const userMap = {};
      result.submissions.forEach(submission => {
        if (submission.userId) {
          if (!userMap[submission.userId]) {
            userMap[submission.userId] = {
              userId: submission.userId,
              name: submission.name,
              email: submission.email,
              company: submission.company,
              submissions: []
            };
          }
          userMap[submission.userId].submissions.push(submission);
        }
      });
      
      const users = Object.values(userMap);
      
      if (users.length === 0) {
        grid.innerHTML = '<p>No registered users with submissions found.</p>';
        return;
      }
      
      grid.innerHTML = users.map(user => `
        <div class="user-card">
          <div class="user-info">
            <h4>${user.name}</h4>
            <p>${user.email}</p>
            ${user.company ? `<p><small>${user.company}</small></p>` : ''}
          </div>
          <div class="user-stats">
            <div class="stat">
              <strong>${user.submissions.length}</strong>
              <small>Projects</small>
            </div>
            <div class="stat">
              <strong>${user.submissions.filter(s => s.status === 'completed').length}</strong>
              <small>Completed</small>
            </div>
          </div>
          <div class="user-actions">
            <button class="btn btn-small" onclick="viewUserProjects('${user.userId}')">View Projects</button>
            <button class="btn btn-small btn-secondary" onclick="editUserInfo('${user.userId}')">Edit Info</button>
          </div>
        </div>
      `).join('');
    }
  });
}

// Metrics Tab Content
function loadMetricsContent() {
  const container = document.getElementById('metricsContainer');
  container.innerHTML = `
    <div class="metrics-dashboard">
      <!-- Revenue Metrics -->
      <div class="metrics-section">
        <h3>Revenue Analytics</h3>
        <div class="revenue-grid">
          <div class="metric-card">
            <div class="metric-icon">💰</div>
            <div class="metric-info">
              <h4 id="totalRevenue">$0</h4>
              <p>Total Revenue</p>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📈</div>
            <div class="metric-info">
              <h4 id="monthlyRevenue">$0</h4>
              <p>This Month</p>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">💵</div>
            <div class="metric-info">
              <h4 id="avgProjectValue">$0</h4>
              <p>Avg Project Value</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Project Progress -->
      <div class="metrics-section">
        <h3>Project Progress</h3>
        <div id="projectProgressList">
          <div class="loading">Loading project progress...</div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="metrics-section">
        <h3>Performance Metrics</h3>
        <div class="performance-grid">
          <div class="metric-card">
            <div class="metric-icon">⚡</div>
            <div class="metric-info">
              <h4 id="completionRate">0%</h4>
              <p>Completion Rate</p>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-info">
              <h4 id="avgProjectTime">0</h4>
              <p>Avg Project Time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  loadMetricsData();
}

function loadMetricsData() {
  firebaseService.getAllSubmissions().then(result => {
    if (result.success) {
      const submissions = result.submissions;
      
      // Calculate revenue metrics
      const budgetValues = {
        'under-100': 75,
        '100-500': 300,
        '500-1k': 750,
        '1k-2.5k': 1750,
        '2.5k-plus': 3500
      };
      
      let totalRevenue = 0;
      let monthlyRevenue = 0;
      const now = new Date();
      
      submissions.forEach(s => {
        if (s.budget && budgetValues[s.budget] && s.status === 'completed') {
          const value = budgetValues[s.budget];
          totalRevenue += value;
          
          const submitDate = new Date(s.timestamp);
          if (submitDate.getMonth() === now.getMonth() && 
              submitDate.getFullYear() === now.getFullYear()) {
            monthlyRevenue += value;
          }
        }
      });
      
      const completedProjects = submissions.filter(s => s.status === 'completed');
      const avgProjectValue = completedProjects.length > 0 ? totalRevenue / completedProjects.length : 0;
      const completionRate = submissions.length > 0 ? (completedProjects.length / submissions.length) * 100 : 0;
      
      document.getElementById('totalRevenue').textContent = `$${totalRevenue.toLocaleString()}`;
      document.getElementById('monthlyRevenue').textContent = `$${monthlyRevenue.toLocaleString()}`;
      document.getElementById('avgProjectValue').textContent = `$${Math.round(avgProjectValue).toLocaleString()}`;
      document.getElementById('completionRate').textContent = `${Math.round(completionRate)}%`;
      
      // Load project progress
      loadProjectProgress(submissions);
    }
  });
}

function loadProjectProgress(submissions) {
  const container = document.getElementById('projectProgressList');
  
  // Group by status for progress view
  const statusGroups = {
    'new': submissions.filter(s => s.status === 'new' || !s.status),
    'in-progress': submissions.filter(s => s.status === 'in-progress'),
    'completed': submissions.filter(s => s.status === 'completed'),
    'archived': submissions.filter(s => s.status === 'archived')
  };
  
  container.innerHTML = `
    <div class="progress-overview">
      ${Object.entries(statusGroups).map(([status, projects]) => `
        <div class="progress-item">
          <div class="progress-header">
            <h4>${status.replace('-', ' ').toUpperCase()}</h4>
            <span class="progress-count">${projects.length} projects</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${submissions.length > 0 ? (projects.length / submissions.length) * 100 : 0}%"></div>
          </div>
          <div class="progress-details">
            ${projects.slice(0, 3).map(p => `
              <div class="project-item">
                <span>${p.name} - ${getProjectDisplayText(p.project)}</span>
                <small>${new Date(p.timestamp).toLocaleDateString()}</small>
              </div>
            `).join('')}
            ${projects.length > 3 ? `<small>+${projects.length - 3} more...</small>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Placeholder functions for user management features
window.viewUserProjects = function(userId) {
  showNotification('User projects view coming soon!', 'info');
};

window.editUserInfo = function(userId) {
  showNotification('User editing coming soon!', 'info');
};

window.refreshUsersData = function() {
  loadUsersData();
  showNotification('User data refreshed!', 'success');
};

// Contact form event listener
function attachContactFormListener() {
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Check if user is logged in
      if (!appState.isUserLoggedIn || !appState.userProfile) {
        showNotification('Please sign in to submit a project inquiry', 'error');
        navigateToPage('account');
        return;
      }
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      console.log('Form data collected:', data);
      console.log('User profile:', appState.userProfile);
      
      // Add user information to submission
      const userId = appState.userProfile.uid || appState.userProfile.id || appState.currentUser?.uid;
      const userDisplayName = appState.userProfile.displayName || `${appState.userProfile.firstName} ${appState.userProfile.lastName}`;
      
      const submissionData = {
        ...data,
        userId: userId,
        name: `${appState.userProfile.firstName} ${appState.userProfile.lastName}`,
        email: appState.userProfile.email,
        userDisplayName: userDisplayName,
        submittedBy: userId,
        userCompany: appState.userProfile.company || data.company
      };
      
      console.log('Submission data:', submissionData);
      
      // Validate user ID exists
      if (!userId) {
        console.error('No user ID found - userProfile:', appState.userProfile, 'currentUser:', appState.currentUser);
        showNotification('User authentication error. Please sign out and sign back in.', 'error');
        return;
      }
      
      // Clean submission data - remove undefined values
      const cleanedSubmissionData = {};
      Object.keys(submissionData).forEach(key => {
        if (submissionData[key] !== undefined && submissionData[key] !== null) {
          cleanedSubmissionData[key] = submissionData[key];
        }
      });
      
      console.log('Cleaned submission data:', cleanedSubmissionData);
      
      // Validate required fields
      if (!cleanedSubmissionData.project || !cleanedSubmissionData.message) {
        console.log('Validation failed - project:', cleanedSubmissionData.project, 'message:', cleanedSubmissionData.message);
        showNotification('Please select a project type and provide a message', 'error');
        return;
      }
      
      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
      
      try {
        console.log('Calling Firebase submitContactForm...');
        const result = await firebaseService.submitContactForm(cleanedSubmissionData);
        console.log('Firebase submission result:', result);
        
        if (result.success) {
          showNotification('Project inquiry submitted successfully! 🎉', 'success');
          form.reset();
          
          // Send email notification for the new submission
          try {
            console.log('Sending email notification...');
            // Create submission object with timestamp for email
            const submissionForEmail = {
              ...cleanedSubmissionData,
              timestamp: Date.now()
            };
            await sendEmailNotification(submissionForEmail);
            console.log('Email notification sent successfully');
          } catch (emailError) {
            console.error('Failed to send email notification:', emailError);
            // Don't show error to user since form was submitted successfully
          }
          
          // Show success message with tracking info
          setTimeout(() => {
            showNotification('You can track this submission in your Account dashboard', 'info');
          }, 2000);
          
        } else {
          console.error('Firebase submission failed:', result.message);
          showNotification('Error: ' + result.message, 'error');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        showNotification('An error occurred while submitting your request. Please try again.', 'error');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

// Account page event listeners
function attachAccountListeners() {
  // Tab switching
  const tabs = document.querySelectorAll('.auth-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const targetTab = e.target.getAttribute('data-tab');
      switchAuthTab(targetTab);
    });
  });

  // Login form
  const loginForm = document.getElementById('userLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleUserLogin);
  }

  // Register form
  const registerForm = document.getElementById('userRegisterForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleUserRegistration);
  }

  // Profile edit form
  const profileForm = document.getElementById('profileEditForm');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
  }

  // Dashboard navigation
  document.addEventListener('click', (e) => {
    if (e.target.hasAttribute('data-page')) {
      e.preventDefault();
      navigateToPage(e.target.getAttribute('data-page'));
    }
  });
}

// Switch between login and register tabs
function switchAuthTab(tab) {
  const tabs = document.querySelectorAll('.auth-tab');
  const forms = document.querySelectorAll('.auth-form');
  
  tabs.forEach(t => t.classList.remove('active'));
  forms.forEach(f => f.style.display = 'none');
  
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(tab === 'login' ? 'loginForm' : 'registerForm').style.display = 'block';
}

// Handle user login
async function handleUserLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('userEmail').value;
  const password = document.getElementById('userPassword').value;
  
  if (!email || !password) {
    showNotification('Please fill in all fields', 'error');
    return;
  }
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Signing In...';
  submitBtn.disabled = true;
  
  try {
    const result = await firebaseService.signInUser(email, password);
    
    if (result.success) {
      appState.isUserLoggedIn = true;
      appState.currentUser = result.user;
      
      // Load user profile data
      try {
        const profileResult = await firebaseService.getUserProfile(result.user.uid);
        if (profileResult.success) {
          appState.userProfile = profileResult.profile;
        } else {
          // Fallback to basic user info if profile not found
          appState.userProfile = {
            firstName: result.user.displayName?.split(' ')[0] || '',
            lastName: result.user.displayName?.split(' ')[1] || '',
            displayName: result.user.displayName || '',
            email: result.user.email
          };
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        appState.userProfile = {
          firstName: result.user.displayName?.split(' ')[0] || '',
          lastName: result.user.displayName?.split(' ')[1] || '',
          displayName: result.user.displayName || '',
          email: result.user.email
        };
      }
      
      showNotification('Welcome back! 🎉', 'success');
      renderCurrentPage();
    } else {
      showNotification(result.message, 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showNotification('An error occurred. Please try again.', 'error');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// Handle user registration
async function handleUserRegistration(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  // Validate required fields
  if (!data.firstName || !data.lastName || !data.email || !data.password) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }
  
  // Validate password confirmation
  if (data.password !== data.confirmPassword) {
    showNotification('Passwords do not match', 'error');
    return;
  }
  
  // Validate password strength
  if (data.password.length < 8) {
    showNotification('Password must be at least 8 characters long', 'error');
    return;
  }
  
  // Check terms agreement
  if (!document.getElementById('agreeTerms').checked) {
    showNotification('Please agree to the Terms of Service', 'error');
    return;
  }
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Creating Account...';
  submitBtn.disabled = true;
  
  try {
    const result = await firebaseService.registerUser(data);
    
    if (result.success) {
      appState.isUserLoggedIn = true;
      appState.currentUser = result.user;
      appState.userProfile = {
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        displayName: `${data.firstName} ${data.lastName}`,
        marketingEmails: document.getElementById('marketingEmails').checked
      };
      showNotification('Account created successfully! Welcome to RNDM Development! 🚀', 'success');
      renderCurrentPage();
    } else {
      showNotification(result.message, 'error');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showNotification('An error occurred. Please try again.', 'error');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// Handle profile updates
async function handleProfileUpdate(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  console.log('Profile update data:', data); // Debug log
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Saving...';
  submitBtn.disabled = true;
  
  try {
    const result = await firebaseService.updateUserProfile(data);
    
    if (result.success) {
      // Update local user profile state with correct field names
      appState.userProfile = { 
        ...appState.userProfile, 
        firstName: data.editFirstName,
        lastName: data.editLastName,
        company: data.editUserCompany,
        phone: data.editPhone,
        displayName: `${data.editFirstName} ${data.editLastName}`
      };
      showNotification('Profile updated successfully! ✅', 'success');
      closeProfileModal();
      renderCurrentPage();
    } else {
      showNotification(result.message, 'error');
    }
  } catch (error) {
    console.error('Profile update error:', error);
    showNotification('An error occurred. Please try again.', 'error');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// User sign out
async function handleUserSignOut() {
  try {
    const result = await firebaseService.signOutUser();
    if (result.success) {
      appState.isUserLoggedIn = false;
      appState.currentUser = null;
      appState.userProfile = null;
      showNotification('Signed out successfully', 'success');
      renderCurrentPage();
    } else {
      showNotification(result.message, 'error');
    }
  } catch (error) {
    console.error('Sign out error:', error);
    showNotification('Error signing out', 'error');
  }
}

// Modal functions for account
function editProfile() {
  // Populate form with current data
  const currentUser = appState.currentUser;
  const userProfile = appState.userProfile;
  
  console.log('Edit profile - Current user:', currentUser);
  console.log('Edit profile - User profile:', userProfile);
  
  if (currentUser || userProfile) {
    const firstNameElement = document.getElementById('editFirstName');
    const lastNameElement = document.getElementById('editLastName');
    const emailElement = document.getElementById('editUserEmail');
    const companyElement = document.getElementById('editUserCompany');
    const phoneElement = document.getElementById('editPhone');
    
    if (firstNameElement) firstNameElement.value = userProfile?.firstName || '';
    if (lastNameElement) lastNameElement.value = userProfile?.lastName || '';
    if (emailElement) emailElement.value = currentUser?.email || '';
    if (companyElement) companyElement.value = userProfile?.company || '';
    if (phoneElement) phoneElement.value = userProfile?.phone || '';
  }
  
  document.getElementById('profileModal').style.display = 'flex';
}

function closeProfileModal() {
  document.getElementById('profileModal').style.display = 'none';
}

// Support Modal Functions
function openSupportModal() {
  loadUserProjects();
  document.getElementById('supportModal').style.display = 'flex';
  
  // Add event listener for support type change
  const supportTypeSelect = document.getElementById('supportType');
  supportTypeSelect.addEventListener('change', handleSupportTypeChange);
  
  // Add form submission handler
  const supportForm = document.getElementById('supportForm');
  supportForm.addEventListener('submit', handleSupportSubmission);
}

function closeSupportModal() {
  document.getElementById('supportModal').style.display = 'none';
  document.getElementById('supportForm').reset();
}

function handleSupportTypeChange(e) {
  const projectGroup = document.getElementById('projectReferenceGroup');
  const selectedType = e.target.value;
  
  // Show project reference for project-related support types
  if (selectedType === 'project-status' || selectedType === 'billing') {
    projectGroup.style.display = 'block';
  } else {
    projectGroup.style.display = 'none';
  }
}

async function loadUserProjects() {
  if (!appState.currentUser) return;
  
  try {
    const userSubmissions = await firebaseService.getUserSubmissions(appState.currentUser.uid);
    const projectSelect = document.getElementById('projectReference');
    
    // Clear existing options (keep the default)
    projectSelect.innerHTML = '<option value="">Select a project (optional)</option>';
    
    // Add user's projects
    userSubmissions.forEach(submission => {
      const option = document.createElement('option');
      option.value = submission.id;
      option.textContent = `${submission.project || 'Unknown'} - ${new Date(submission.timestamp).toLocaleDateString()}`;
      projectSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading user projects:', error);
  }
}

async function handleSupportSubmission(e) {
  e.preventDefault();
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled = true;
  
  try {
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Add user information
    const supportData = {
      ...data,
      userId: appState.currentUser.uid,
      userName: `${appState.userProfile?.firstName} ${appState.userProfile?.lastName}`,
      userEmail: appState.userProfile?.email,
      userCompany: appState.userProfile?.company || '',
      submissionType: 'support',
      timestamp: Date.now(),
      status: 'open'
    };
    
    // Submit to Firebase (using a different path for support tickets)
    const result = await firebaseService.submitSupportTicket(supportData);
    
    if (result.success) {
      showNotification('Support request submitted successfully! We\'ll get back to you soon.', 'success');
      closeSupportModal();
      
      // Send email notification
      await sendSupportEmail(supportData);
    } else {
      showNotification(`Failed to submit support request: ${result.message}`, 'error');
    }
  } catch (error) {
    console.error('Support submission error:', error);
    showNotification('Failed to submit support request. Please try again.', 'error');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

async function sendSupportEmail(supportData) {
  try {
    const emailParams = {
      to_email: 'support@rndmdevelopment.com', // Your support email
      from_name: supportData.userName,
      from_email: supportData.userEmail,
      support_type: supportData.supportType,
      priority: supportData.supportPriority,
      subject: supportData.supportSubject,
      message: supportData.supportMessage,
      contact_method: supportData.contactMethod,
      project_reference: supportData.projectReference || 'None',
      user_company: supportData.userCompany || 'Not specified',
      submission_time: new Date().toLocaleString()
    };
    
    // Use EmailJS to send support notification
    await emailjs.send('support_service', 'support_template', emailParams);
  } catch (error) {
    console.error('Error sending support email:', error);
    // Don't show error to user since their request was still submitted
  }
}

// Placeholder functions for dashboard features
// User dashboard functions
async function loadUserDashboardData() {
  if (!appState.userProfile?.uid && !appState.userProfile?.id && !appState.currentUser?.uid) {
    console.log('No user ID found for dashboard data loading');
    return;
  }
  
  console.log('Loading user dashboard data for:', appState.userProfile);
  
  try {
    const userId = appState.userProfile?.uid || appState.userProfile?.id || appState.currentUser?.uid;
    
    // Get user's submissions
    const submissions = await firebaseService.getUserSubmissions(userId);
    console.log('User submissions loaded:', submissions);
    
    // Update project overview stats
    const totalInquiries = submissions.length;
    const activeProjects = submissions.filter(s => s.status === 'active' || s.status === 'in-progress' || !s.status).length;
    const completedProjects = submissions.filter(s => s.status === 'completed').length;
    
    // Update UI elements
    const totalInquiriesEl = document.getElementById('totalInquiries');
    const activeProjectsEl = document.getElementById('activeProjects');
    const completedProjectsEl = document.getElementById('completedProjects');
    
    if (totalInquiriesEl) totalInquiriesEl.textContent = totalInquiries;
    if (activeProjectsEl) activeProjectsEl.textContent = activeProjects;
    if (completedProjectsEl) completedProjectsEl.textContent = completedProjects;
    
    // Update recent activity
    updateRecentActivity(submissions.slice(0, 5)); // Show last 5 submissions
    
    // Update user info display if data has changed
    updateUserInfoDisplay();
    
  } catch (error) {
    console.error('Error loading user dashboard data:', error);
  }
}

// Update user info display with current data
function updateUserInfoDisplay() {
  const userNameEl = document.querySelector('.user-info h2');
  const userEmailEl = document.querySelector('.user-email');
  const userCompanyEl = document.querySelector('.user-company');
  
  if (userNameEl && appState.userProfile) {
    const displayName = appState.userProfile.firstName ? 
      `${appState.userProfile.firstName} ${appState.userProfile.lastName || ''}`.trim() : 
      appState.userProfile.displayName || 'User';
    userNameEl.textContent = `Welcome back, ${displayName}!`;
  }
  
  if (userEmailEl) {
    userEmailEl.textContent = appState.userProfile?.email || appState.currentUser?.email || 'No email';
  }
  
  if (userCompanyEl && appState.userProfile?.company) {
    userCompanyEl.textContent = `Company: ${appState.userProfile.company}`;
    userCompanyEl.style.display = 'block';
  } else if (userCompanyEl) {
    userCompanyEl.style.display = 'none';
  }
}

// Update recent activity section
function updateRecentActivity(submissions) {
  const activityContainer = document.getElementById('recentActivity');
  if (!activityContainer) return;
  
  if (submissions.length === 0) {
    activityContainer.innerHTML = `
      <div class="activity-item">
        <div class="activity-icon">🎯</div>
        <div class="activity-details">
          <p class="activity-title">Welcome to RNDM Development!</p>
          <p class="activity-time">Ready to start your first project?</p>
        </div>
      </div>
    `;
    return;
  }
  
  const activityHTML = submissions.map(submission => {
    const date = new Date(submission.timestamp || Date.now());
    const timeAgo = getTimeAgo(date);
    const projectType = submission.project || 'General Inquiry';
    
    let statusIcon = '📝';
    let statusText = 'Submitted';
    
    if (submission.status === 'completed') {
      statusIcon = '✅';
      statusText = 'Completed';
    } else if (submission.status === 'in-progress' || submission.status === 'active') {
      statusIcon = '🚀';
      statusText = 'In Progress';
    }
    
    return `
      <div class="activity-item">
        <div class="activity-icon">${statusIcon}</div>
        <div class="activity-details">
          <p class="activity-title">${projectType} - ${statusText}</p>
          <p class="activity-time">${timeAgo}</p>
        </div>
      </div>
    `;
  }).join('');
  
  activityContainer.innerHTML = activityHTML;
}

// Helper function to get time ago string
function getTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else {
    return 'Just now';
  }
}

function viewAllActivity() {
  showNotification('Activity history feature coming soon! 📋', 'info');
}

function viewProjects() {
  if (!appState.userProfile?.uid) {
    showNotification('Please sign in to view your projects', 'error');
    return;
  }
  
  // Show projects modal
  showProjectsModal();
}

// Show projects modal
async function showProjectsModal() {
  try {
    const submissions = await firebaseService.getUserSubmissions(appState.userProfile.uid);
    
    const modalHTML = `
      <div class="modal-overlay" id="projectsModal" onclick="closeProjectsModal(event)">
        <div class="modal-content large-modal">
          <div class="modal-header">
            <h2>My Projects & Inquiries</h2>
            <button class="close-btn" onclick="closeProjectsModal()">&times;</button>
          </div>
          <div class="modal-body">
            ${submissions.length === 0 ? `
              <div class="empty-state">
                <h3>No projects yet</h3>
                <p>Submit your first project inquiry to get started!</p>
                <button class="btn btn-primary" onclick="closeProjectsModal(); navigateToPage('contact');">
                  Start New Project
                </button>
              </div>
            ` : `
              <div class="projects-list">
                ${submissions.map(submission => `
                  <div class="project-card">
                    <div class="project-header">
                      <h4>${submission.project || 'General Inquiry'}</h4>
                      <span class="project-status ${submission.status || 'pending'}">${getStatusText(submission.status)}</span>
                    </div>
                    <div class="project-details">
                      <p><strong>Submitted:</strong> ${new Date(submission.timestamp || Date.now()).toLocaleDateString()}</p>
                      ${submission.budget ? `<p><strong>Budget:</strong> ${submission.budget}</p>` : ''}
                      ${submission.timeline ? `<p><strong>Timeline:</strong> ${submission.timeline}</p>` : ''}
                      <p><strong>Message:</strong> ${submission.message}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  } catch (error) {
    console.error('Error showing projects modal:', error);
    showNotification('Error loading projects', 'error');
  }
}

// Close projects modal
function closeProjectsModal(event) {
  if (event && event.target !== event.currentTarget) return;
  const modal = document.getElementById('projectsModal');
  if (modal) {
    modal.remove();
  }
}

// Get status text for display
function getStatusText(status) {
  switch (status) {
    case 'completed': return 'Completed';
    case 'in-progress': 
    case 'active': return 'In Progress';
    case 'pending': return 'Pending';
    case 'cancelled': return 'Cancelled';
    default: return 'Submitted';
  }
}

function downloadInvoices() {
  showNotification('Invoice management feature coming soon! 💰', 'info');
}

function contactSupport() {
  openSupportModal();
}

function changePassword() {
  showNotification('Password change feature coming soon! 🔒', 'info');
}

function notificationSettings() {
  showNotification('Notification settings coming soon! 🔔', 'info');
}

function billingSettings() {
  showNotification('Billing management coming soon! 💳', 'info');
}

function signInWithGoogle() {
  showNotification('Google Sign-In coming soon! 🔐', 'info');
}

function signUpWithGoogle() {
  showNotification('Google Sign-Up coming soon! 🔐', 'info');
}

function showForgotPassword() {
  showNotification('Password reset feature coming soon! 📧', 'info');
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
      
      // Send browser notification (email already sent during form submission)
      sendBrowserNotification(newestSubmission);
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

function getTimelineDisplayText(value) {
  const timelines = {
    'asap': 'ASAP',
    '1-month': 'Within 1 month',
    '2-3-months': '2-3 months',
    'flexible': 'Flexible'
  };
  return timelines[value] || value || 'N/A';
}

function updateAnalytics(submissions) {
  // Total submissions - check if element exists (old analytics view)
  const totalSubmissionsEl = document.getElementById('totalSubmissions');
  if (totalSubmissionsEl) {
    totalSubmissionsEl.textContent = submissions.length;
  }
  
  // This month submissions
  const now = new Date();
  const thisMonth = submissions.filter(s => {
    const date = new Date(s.timestamp);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  
  const thisMonthEl = document.getElementById('thisMonth');
  if (thisMonthEl) {
    thisMonthEl.textContent = thisMonth.length;
  }
  
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
  
  const avgBudgetEl = document.getElementById('avgBudget');
  if (avgBudgetEl) {
    avgBudgetEl.textContent = avgBudget > 0 ? `$${avgBudget.toLocaleString()}` : '$0';
  }
  
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
  
  const topProjectEl = document.getElementById('topProject');
  if (topProjectEl) {
    topProjectEl.textContent = topProject;
  }
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
            <th>Timeline</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${submissions.map(submission => {
            const status = submission.status || 'new';
            const statusClass = `status-${status}`;
            return `
              <tr class="submission-row" onclick="showSubmissionActions('${submission.id}', event)" data-submission-id="${submission.id}">
                <td>${new Date(submission.timestamp).toLocaleDateString()}</td>
                <td>${submission.name || 'N/A'}</td>
                <td>${submission.email || 'N/A'}</td>
                <td>${submission.company || 'N/A'}</td>
                <td>${getProjectDisplayText(submission.project)}</td>
                <td>${getBudgetDisplayText(submission.budget)}</td>
                <td>${getTimelineDisplayText(submission.timeline)}</td>
                <td><span class="status-badge ${statusClass}">${status.replace('-', ' ')}</span></td>
                <td class="actions-cell">
                  <button class="btn-icon" onclick="event.stopPropagation(); showSubmissionActions('${submission.id}', event)" title="Actions">⚙️</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
    
    <!-- Actions Popup Menu -->
    <div id="submissionActionsPopup" class="actions-popup" style="display: none;">
      <div class="actions-popup-content">
        <h4>Actions</h4>
        <button class="action-btn" id="viewDetailsBtn">
          <span class="action-icon">👁️</span>
          View Details
        </button>
        <button class="action-btn" id="editSubmissionBtn">
          <span class="action-icon">✏️</span>
          Edit Submission
        </button>
        <button class="action-btn" id="emailSubmissionBtn">
          <span class="action-icon">📧</span>
          Send Email
        </button>
        <button class="action-btn danger" id="deleteSubmissionBtn">
          <span class="action-icon">🗑️</span>
          Delete Submission
        </button>
        <button class="action-btn secondary" onclick="closeSubmissionActions()">
          <span class="action-icon">✕</span>
          Cancel
        </button>
      </div>
    </div>
  `;
  
  container.innerHTML = tableHTML;
}

// Global variable to track current submission
let currentSubmissionId = null;

// Show submission actions popup
function showSubmissionActions(submissionId, event) {
  event.stopPropagation();
  currentSubmissionId = submissionId;
  
  const popup = document.getElementById('submissionActionsPopup');
  const rect = event.target.getBoundingClientRect();
  
  // Position popup near the click
  popup.style.display = 'block';
  popup.style.left = (rect.left + window.scrollX) + 'px';
  popup.style.top = (rect.bottom + window.scrollY + 5) + 'px';
  
  // Attach event listeners to action buttons
  document.getElementById('viewDetailsBtn').onclick = () => {
    viewSubmissionDetail(submissionId);
    closeSubmissionActions();
  };
  
  document.getElementById('editSubmissionBtn').onclick = () => {
    editSubmission(submissionId);
    closeSubmissionActions();
  };
  
  document.getElementById('emailSubmissionBtn').onclick = () => {
    emailSubmission(submissionId);
    closeSubmissionActions();
  };
  
  document.getElementById('deleteSubmissionBtn').onclick = () => {
    deleteSubmission(submissionId);
    closeSubmissionActions();
  };
  
  // Close popup when clicking outside
  setTimeout(() => {
    document.addEventListener('click', closeSubmissionActions, { once: true });
  }, 100);
}

// Close submission actions popup
function closeSubmissionActions() {
  const popup = document.getElementById('submissionActionsPopup');
  popup.style.display = 'none';
  currentSubmissionId = null;
}

// Make functions globally available
window.showSubmissionActions = showSubmissionActions;
window.closeSubmissionActions = closeSubmissionActions;

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

// Support Ticket Functions
function loadSupportTickets() {
  const container = document.getElementById('supportTicketsContainer');
  container.innerHTML = `
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>Loading support tickets...</p>
    </div>
  `;

  firebaseService.getAllSupportTickets()
    .then(result => {
      console.log('Support tickets result:', result);
      if (result.success) {
        allSupportTickets = result.tickets || [];
        filteredSupportTickets = [...allSupportTickets];
        renderSupportTicketsTable(filteredSupportTickets);
      } else {
        container.innerHTML = `<p class="error">Failed to load support tickets: ${result.message}</p>`;
      }
    })
    .catch(error => {
      console.error('Error loading support tickets:', error);
      container.innerHTML = `<p class="error">Error loading support tickets: ${error.message}</p>`;
    });
}

function renderSupportTicketsTable(tickets) {
  const container = document.getElementById('supportTicketsContainer');
  
  if (!tickets || tickets.length === 0) {
    container.innerHTML = '<p>No support tickets found.</p>';
    return;
  }

  // Sort tickets by timestamp (newest first)
  const sortedTickets = tickets.sort((a, b) => b.timestamp - a.timestamp);

  let tableHTML = `
    <div class="submissions-table">
      <table>
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Date</th>
            <th>User</th>
            <th>Support Type</th>
            <th>Priority</th>
            <th>Subject</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
  `;

  sortedTickets.forEach(ticket => {
    const priorityBadge = getPriorityBadge(ticket.supportPriority);
    const statusBadge = getStatusBadge(ticket.status || 'open');
    const supportType = getSupportTypeDisplay(ticket.supportType);
    
    tableHTML += `
      <tr class="ticket-row" onclick="showSupportTicketActions('${ticket.id}', event)" data-ticket-id="${ticket.id}">
        <td><code>${ticket.ticketId || ticket.id}</code></td>
        <td>${new Date(ticket.timestamp).toLocaleDateString()}</td>
        <td>
          <div class="user-info">
            <strong>${ticket.userName || 'Unknown'}</strong>
            <small>${ticket.userEmail || ''}</small>
          </div>
        </td>
        <td>${supportType}</td>
        <td>${priorityBadge}</td>
        <td class="subject-cell">
          <strong>${ticket.supportSubject || 'No Subject'}</strong>
          <div class="message-preview">${(ticket.supportMessage || '').substring(0, 100)}${ticket.supportMessage && ticket.supportMessage.length > 100 ? '...' : ''}</div>
        </td>
        <td>${statusBadge}</td>
      </tr>
    `;
  });

  tableHTML += `
        </tbody>
      </table>
    </div>
    
    <!-- Support Ticket Actions Popup Menu -->
    <div id="supportTicketActionsPopup" class="actions-popup" style="display: none;">
      <div class="actions-popup-content">
        <h4>Actions</h4>
        <button class="action-btn" id="viewSupportTicketBtn">
          <span class="action-icon">👁️</span>
          View Details
        </button>
        <button class="action-btn" id="editSupportTicketBtn">
          <span class="action-icon">✏️</span>
          Edit Ticket
        </button>
        <button class="action-btn" id="emailSupportTicketBtn">
          <span class="action-icon">📧</span>
          Send Email
        </button>
        <button class="action-btn" id="respondSupportTicketBtn">
          <span class="action-icon">💬</span>
          Respond to Ticket
        </button>
        <button class="action-btn danger" id="deleteSupportTicketBtn">
          <span class="action-icon">🗑️</span>
          Delete Ticket
        </button>
        <button class="action-btn secondary" onclick="closeSupportTicketActions()">
          <span class="action-icon">✕</span>
          Cancel
        </button>
      </div>
    </div>
  `;

  container.innerHTML = tableHTML;
}

function getPriorityBadge(priority) {
  const priorities = {
    'low': { class: 'priority-low', text: 'Low' },
    'medium': { class: 'priority-medium', text: 'Medium' },
    'high': { class: 'priority-high', text: 'High' },
    'urgent': { class: 'priority-urgent', text: 'Urgent' }
  };
  
  const p = priorities[priority] || priorities['medium'];
  return `<span class="priority-badge ${p.class}">${p.text}</span>`;
}

function getStatusBadge(status) {
  const statuses = {
    'open': { class: 'status-open', text: 'Open' },
    'in-progress': { class: 'status-in-progress', text: 'In Progress' },
    'resolved': { class: 'status-resolved', text: 'Resolved' },
    'closed': { class: 'status-closed', text: 'Closed' },
    'pending': { class: 'status-pending', text: 'Pending' }
  };
  
  const s = statuses[status] || statuses['open'];
  return `<span class="status-badge ${s.class}">${s.text}</span>`;
}

function getSupportTypeDisplay(type) {
  const types = {
    'account-issues': 'Account Issues',
    'project-status': 'Project Status',
    'billing': 'Billing',
    'technical-support': 'Technical Support',
    'feature-request': 'Feature Request',
    'bug-report': 'Bug Report'
  };
  
  return types[type] || type;
}

function showSupportTicketActions(ticketId, event) {
  event.stopPropagation();
  currentSupportTicketId = ticketId;
  
  const popup = document.getElementById('supportTicketActionsPopup');
  const ticket = allSupportTickets.find(t => t.id === ticketId);
  
  if (ticket && popup) {
    const rect = event.target.getBoundingClientRect();
    
    // Position popup near the click
    popup.style.display = 'block';
    popup.style.left = (rect.left + window.scrollX) + 'px';
    popup.style.top = (rect.bottom + window.scrollY + 5) + 'px';
    
    // Attach event listeners to action buttons
    document.getElementById('viewSupportTicketBtn').onclick = () => {
      viewSupportTicketDetail(ticketId);
      closeSupportTicketActions();
    };
    
    document.getElementById('editSupportTicketBtn').onclick = () => {
      editSupportTicket(ticketId);
      closeSupportTicketActions();
    };
    
    document.getElementById('emailSupportTicketBtn').onclick = () => {
      emailSupportTicket(ticketId);
      closeSupportTicketActions();
    };
    
    document.getElementById('respondSupportTicketBtn').onclick = () => {
      respondToSupportTicket(ticketId);
      closeSupportTicketActions();
    };
    
    document.getElementById('deleteSupportTicketBtn').onclick = () => {
      deleteSupportTicket(ticketId);
      closeSupportTicketActions();
    };
    
    // Close popup when clicking outside
    setTimeout(() => {
      document.addEventListener('click', closeSupportTicketActions, { once: true });
    }, 100);
  }
}

function closeSupportTicketActions() {
  const popup = document.getElementById('supportTicketActionsPopup');
  if (popup) {
    popup.style.display = 'none';
  }
  currentSupportTicketId = null;
}

// New support ticket action functions to match forms tab functionality
function viewSupportTicketDetail(ticketId) {
  const ticket = allSupportTickets.find(t => t.id === ticketId);
  if (!ticket) {
    showNotification('Support ticket not found', 'error');
    return;
  }
  
  const detailHTML = `
    <div class="submission-detail">
      <div class="detail-grid">
        <div class="detail-item">
          <label>Ticket ID:</label>
          <span><code>${ticket.ticketId || ticket.id}</code></span>
        </div>
        <div class="detail-item">
          <label>Date Submitted:</label>
          <span>${new Date(ticket.timestamp).toLocaleString()}</span>
        </div>
        <div class="detail-item">
          <label>User Name:</label>
          <span>${ticket.userName || 'Unknown'}</span>
        </div>
        <div class="detail-item">
          <label>Email:</label>
          <span>${ticket.userEmail || 'Not provided'}</span>
        </div>
        <div class="detail-item">
          <label>Support Type:</label>
          <span>${getSupportTypeDisplay(ticket.supportType)}</span>
        </div>
        <div class="detail-item">
          <label>Priority:</label>
          <span class="priority-badge priority-${ticket.supportPriority || 'medium'}">${(ticket.supportPriority || 'medium').charAt(0).toUpperCase() + (ticket.supportPriority || 'medium').slice(1)}</span>
        </div>
        <div class="detail-item">
          <label>Status:</label>
          <span class="status-badge status-${ticket.status || 'open'}">${(ticket.status || 'open').replace('-', ' ')}</span>
        </div>
        <div class="detail-item">
          <label>Subject:</label>
          <span>${ticket.supportSubject || 'No Subject'}</span>
        </div>
      </div>
      <div class="detail-message">
        <label>Message:</label>
        <div class="message-content">${ticket.supportMessage || 'No message provided'}</div>
      </div>
      <div class="detail-actions">
        <button class="btn btn-primary" onclick="editSupportTicket('${ticketId}'); closeDetailModal();">Edit Ticket</button>
        <button class="btn btn-secondary" onclick="emailSupportTicket('${ticketId}')">Send Email</button>
        <button class="btn btn-secondary" onclick="respondToSupportTicket('${ticketId}')">Respond to Ticket</button>
      </div>
    </div>
  `;
  
  document.getElementById('detailModalBody').innerHTML = detailHTML;
  document.getElementById('detailModal').style.display = 'flex';
}

function emailSupportTicket(ticketId) {
  const ticket = allSupportTickets.find(t => t.id === ticketId);
  if (!ticket || !ticket.userEmail) {
    showNotification('No email address found for this support ticket', 'error');
    return;
  }
  
  const subject = encodeURIComponent(`Re: Support Ticket #${ticket.ticketId || ticket.id} - ${ticket.supportSubject || 'Your Support Request'}`);
  const body = encodeURIComponent(`Hi ${ticket.userName || 'there'},\n\nThank you for contacting our support team regarding "${ticket.supportSubject || 'your support request'}". We have received your ticket and will respond shortly.\n\nTicket ID: ${ticket.ticketId || ticket.id}\nSupport Type: ${getSupportTypeDisplay(ticket.supportType)}\nPriority: ${(ticket.supportPriority || 'medium').charAt(0).toUpperCase() + (ticket.supportPriority || 'medium').slice(1)}\n\nBest regards,\nRNDM Development Support Team`);
  
  window.open(`mailto:${ticket.userEmail}?subject=${subject}&body=${body}`);
}

function respondToSupportTicket(ticketId) {
  const ticket = allSupportTickets.find(t => t.id === ticketId);
  if (!ticket) {
    showNotification('Support ticket not found', 'error');
    return;
  }
  
  const response = prompt(`Respond to Support Ticket #${ticket.ticketId || ticket.id}:\n\nSubject: ${ticket.supportSubject || 'No Subject'}\nFrom: ${ticket.userName || 'Unknown'} (${ticket.userEmail || 'No email'})\n\nEnter your response:`);
  
  if (response) {
    // For now, just show a success message and update status to "in-progress"
    ticket.status = 'in-progress';
    ticket.lastResponse = {
      message: response,
      timestamp: Date.now(),
      responder: appState.currentUser?.email || 'Admin'
    };
    
    // Re-render the table
    renderSupportTicketsTable(filteredSupportTickets);
    
    showNotification('Response recorded and ticket updated to "In Progress"', 'success');
    
    // Also open email client for actual response
    if (ticket.userEmail) {
      const subject = encodeURIComponent(`Re: Support Ticket #${ticket.ticketId || ticket.id} - ${ticket.supportSubject || 'Your Support Request'}`);
      const body = encodeURIComponent(response);
      window.open(`mailto:${ticket.userEmail}?subject=${subject}&body=${body}`);
    }
  }
}

// Support ticket filter functions
function applySupportFilters() {
  const searchTerm = document.getElementById('supportSearchFilter').value.toLowerCase();
  const typeFilter = document.getElementById('supportTypeFilter').value;
  const priorityFilter = document.getElementById('priorityFilter').value;
  const statusFilter = document.getElementById('supportStatusFilter').value;
  const dateFrom = document.getElementById('supportDateFrom').value;
  const dateTo = document.getElementById('supportDateTo').value;
  
  filteredSupportTickets = allSupportTickets.filter(ticket => {
    // Search filter
    if (searchTerm && !supportSearchMatches(ticket, searchTerm)) {
      return false;
    }
    
    // Type filter
    if (typeFilter && ticket.supportType !== typeFilter) {
      return false;
    }
    
    // Priority filter
    if (priorityFilter && ticket.supportPriority !== priorityFilter) {
      return false;
    }
    
    // Status filter
    if (statusFilter && ticket.status !== statusFilter) {
      return false;
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      const ticketDate = new Date(ticket.timestamp).toISOString().split('T')[0];
      if (dateFrom && ticketDate < dateFrom) return false;
      if (dateTo && ticketDate > dateTo) return false;
    }
    
    return true;
  });
  
  renderSupportTicketsTable(filteredSupportTickets);
}

function clearSupportFilters() {
  document.getElementById('supportSearchFilter').value = '';
  document.getElementById('supportTypeFilter').value = '';
  document.getElementById('priorityFilter').value = '';
  document.getElementById('supportStatusFilter').value = '';
  document.getElementById('supportDateFrom').value = '';
  document.getElementById('supportDateTo').value = '';
  
  filteredSupportTickets = [...allSupportTickets];
  renderSupportTicketsTable(filteredSupportTickets);
}

function supportSearchMatches(ticket, searchTerm) {
  const searchableText = [
    ticket.userName,
    ticket.userEmail,
    ticket.supportSubject,
    ticket.supportMessage,
    ticket.ticketId,
    ticket.userCompany
  ].join(' ').toLowerCase();
  
  return searchableText.includes(searchTerm);
}

// Export support data functions
function exportSupportData(format) {
  if (!filteredSupportTickets || filteredSupportTickets.length === 0) {
    showNotification('No support tickets to export', 'warning');
    return;
  }
  
  const data = filteredSupportTickets.map(ticket => ({
    'Ticket ID': ticket.ticketId || ticket.id,
    Date: new Date(ticket.timestamp).toLocaleDateString(),
    'User Name': ticket.userName || '',
    'User Email': ticket.userEmail || '',
    'Support Type': getSupportTypeDisplay(ticket.supportType),
    Priority: ticket.supportPriority || '',
    Subject: ticket.supportSubject || '',
    Message: ticket.supportMessage || '',
    Status: ticket.status || 'open',
    'Contact Method': ticket.contactMethod || '',
    'Project Reference': ticket.projectReference || 'None'
  }));
  
  if (format === 'csv') {
    exportSupportToCSV(data);
  } else if (format === 'json') {
    exportSupportToJSON(data);
  }
}

function exportSupportToCSV(data) {
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header].replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  downloadFile(csvContent, 'support-tickets.csv', 'text/csv');
}

function exportSupportToJSON(data) {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, 'support-tickets.json', 'application/json');
}

// Global variables for support tickets
let allSupportTickets = [];
let filteredSupportTickets = [];
let currentSupportTicketId = null;

// Support ticket action functions
function viewSupportTicket(ticketId) {
  const ticket = allSupportTickets.find(t => t.id === ticketId);
  if (!ticket) return;
  
  // For now, show an alert with ticket details
  const details = `
Ticket ID: ${ticket.ticketId || ticket.id}
User: ${ticket.userName} (${ticket.userEmail})
Support Type: ${getSupportTypeDisplay(ticket.supportType)}
Priority: ${ticket.supportPriority}
Subject: ${ticket.supportSubject}
Message: ${ticket.supportMessage}
Status: ${ticket.status || 'open'}
Contact Method: ${ticket.contactMethod}
Project Reference: ${ticket.projectReference || 'None'}
Date: ${new Date(ticket.timestamp).toLocaleString()}
  `;
  
  alert(details);
  closeSupportTicketActions();
}

function editSupportTicket(ticketId) {
  const ticket = allSupportTickets.find(t => t.id === ticketId);
  if (!ticket) {
    showNotification('Support ticket not found', 'error');
    return;
  }
  
  // Create edit modal content for support ticket
  const editHTML = `
    <div class="edit-support-ticket">
      <div class="form-row">
        <div class="form-group">
          <label for="editTicketStatus">Status</label>
          <select id="editTicketStatus">
            <option value="open" ${(ticket.status || 'open') === 'open' ? 'selected' : ''}>Open</option>
            <option value="in-progress" ${(ticket.status || 'open') === 'in-progress' ? 'selected' : ''}>In Progress</option>
            <option value="resolved" ${(ticket.status || 'open') === 'resolved' ? 'selected' : ''}>Resolved</option>
            <option value="closed" ${(ticket.status || 'open') === 'closed' ? 'selected' : ''}>Closed</option>
            <option value="pending" ${(ticket.status || 'open') === 'pending' ? 'selected' : ''}>Pending</option>
          </select>
        </div>
        <div class="form-group">
          <label for="editTicketPriority">Priority</label>
          <select id="editTicketPriority">
            <option value="low" ${(ticket.supportPriority || 'medium') === 'low' ? 'selected' : ''}>Low</option>
            <option value="medium" ${(ticket.supportPriority || 'medium') === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="high" ${(ticket.supportPriority || 'medium') === 'high' ? 'selected' : ''}>High</option>
            <option value="urgent" ${(ticket.supportPriority || 'medium') === 'urgent' ? 'selected' : ''}>Urgent</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="editTicketType">Support Type</label>
          <select id="editTicketType">
            <option value="account-issues" ${ticket.supportType === 'account-issues' ? 'selected' : ''}>Account Issues</option>
            <option value="project-status" ${ticket.supportType === 'project-status' ? 'selected' : ''}>Project Status</option>
            <option value="billing" ${ticket.supportType === 'billing' ? 'selected' : ''}>Billing</option>
            <option value="technical-support" ${ticket.supportType === 'technical-support' ? 'selected' : ''}>Technical Support</option>
            <option value="feature-request" ${ticket.supportType === 'feature-request' ? 'selected' : ''}>Feature Request</option>
            <option value="bug-report" ${ticket.supportType === 'bug-report' ? 'selected' : ''}>Bug Report</option>
          </select>
        </div>
        <div class="form-group">
          <label for="editTicketSubject">Subject</label>
          <input type="text" id="editTicketSubject" value="${ticket.supportSubject || ''}" placeholder="Ticket subject">
        </div>
      </div>
      <div class="form-group">
        <label for="editTicketMessage">Message</label>
        <textarea id="editTicketMessage" rows="4" placeholder="Ticket description">${ticket.supportMessage || ''}</textarea>
      </div>
      <div class="form-group">
        <label for="editTicketNotes">Admin Notes</label>
        <textarea id="editTicketNotes" rows="3" placeholder="Internal notes for this ticket">${ticket.adminNotes || ''}</textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeEditModal()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="saveSupportTicketEdit('${ticketId}')">Save Changes</button>
      </div>
    </div>
  `;
  
  document.getElementById('editModalTitle').textContent = 'Edit Support Ticket';
  document.getElementById('editModalBody').innerHTML = editHTML;
  document.getElementById('editModal').style.display = 'flex';
}

function saveSupportTicketEdit(ticketId) {
  const ticket = allSupportTickets.find(t => t.id === ticketId);
  if (!ticket) {
    showNotification('Support ticket not found', 'error');
    return;
  }
  
  // Get updated values
  const updatedData = {
    status: document.getElementById('editTicketStatus').value,
    supportPriority: document.getElementById('editTicketPriority').value,
    supportType: document.getElementById('editTicketType').value,
    supportSubject: document.getElementById('editTicketSubject').value,
    supportMessage: document.getElementById('editTicketMessage').value,
    adminNotes: document.getElementById('editTicketNotes').value,
    lastModified: Date.now(),
    lastModifiedBy: appState.currentUser?.email || 'Admin'
  };
  
  // Save to Firebase
  firebaseService.updateSupportTicket(ticketId, updatedData)
    .then(result => {
      if (result.success) {
        // Update the ticket in the local arrays
        const updatedTicket = { ...ticket, ...updatedData };
        
        const ticketIndex = allSupportTickets.findIndex(t => t.id === ticketId);
        if (ticketIndex !== -1) {
          allSupportTickets[ticketIndex] = updatedTicket;
        }
        
        const filteredIndex = filteredSupportTickets.findIndex(t => t.id === ticketId);
        if (filteredIndex !== -1) {
          filteredSupportTickets[filteredIndex] = updatedTicket;
        }
        
        // Re-render the table
        renderSupportTicketsTable(filteredSupportTickets);
        
        // Close modal and show success
        closeEditModal();
        showNotification('Support ticket updated successfully', 'success');
      } else {
        showNotification(result.message, 'error');
      }
    })
    .catch(error => {
      console.error('Update error:', error);
      showNotification('Failed to update support ticket', 'error');
    });
}

function deleteSupportTicket(ticketId) {
  const ticket = allSupportTickets.find(t => t.id === ticketId);
  if (!ticket) {
    showNotification('Support ticket not found', 'error');
    return;
  }
  
  if (confirm(`Are you sure you want to delete ticket ${ticket.ticketId || ticket.id}?\n\nThis action cannot be undone.`)) {
    // Delete from Firebase
    firebaseService.deleteSupportTicket(ticketId)
      .then(result => {
        if (result.success) {
          // Remove from local arrays
          allSupportTickets = allSupportTickets.filter(t => t.id !== ticketId);
          filteredSupportTickets = filteredSupportTickets.filter(t => t.id !== ticketId);
          
          // Re-render the table
          renderSupportTicketsTable(filteredSupportTickets);
          
          showNotification('Support ticket deleted successfully', 'success');
        } else {
          showNotification(result.message, 'error');
        }
      })
      .catch(error => {
        console.error('Delete error:', error);
        showNotification('Failed to delete support ticket', 'error');
      });
  }
  
  closeSupportTicketActions();
}

// Modal functions
function editSubmission(id) {
  console.log('editSubmission called with id:', id);
  const submission = allSubmissions.find(s => s.id === id);
  if (!submission) {
    console.error('Submission not found:', id);
    showNotification('Submission not found', 'error');
    return;
  }
  
  // Create edit modal content for submission
  const editHTML = `
    <form id="editSubmissionForm">
      <input type="hidden" id="editSubmissionId" value="${id}">
      <div class="form-row">
        <div class="form-group">
          <label for="editName">Name</label>
          <input type="text" id="editName" value="${submission.name || ''}" required>
        </div>
        <div class="form-group">
          <label for="editEmail">Email</label>
          <input type="email" id="editEmail" value="${submission.email || ''}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="editCompany">Company</label>
          <input type="text" id="editCompany" value="${submission.company || ''}">
        </div>
        <div class="form-group">
          <label for="editProject">Project Type</label>
          <select id="editProject">
            <option value="website" ${submission.project === 'website' ? 'selected' : ''}>Website Development</option>
            <option value="redesign" ${submission.project === 'redesign' ? 'selected' : ''}>Website Redesign</option>
            <option value="optimization" ${submission.project === 'optimization' ? 'selected' : ''}>Performance Optimization</option>
            <option value="maintenance" ${submission.project === 'maintenance' ? 'selected' : ''}>Website Maintenance</option>
            <option value="consultation" ${submission.project === 'consultation' ? 'selected' : ''}>Consultation</option>
            <option value="other" ${submission.project === 'other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="editBudget">Budget</label>
          <select id="editBudget">
            <option value="under-100" ${submission.budget === 'under-100' ? 'selected' : ''}>Under $100</option>
            <option value="100-500" ${submission.budget === '100-500' ? 'selected' : ''}>$100 - $500</option>
            <option value="500-1k" ${submission.budget === '500-1k' ? 'selected' : ''}>$500 - $1,000</option>
            <option value="1k-2.5k" ${submission.budget === '1k-2.5k' ? 'selected' : ''}>$1,000 - $2,500</option>
            <option value="2.5k-plus" ${submission.budget === '2.5k-plus' ? 'selected' : ''}>$2,500+</option>
            <option value="discuss" ${submission.budget === 'discuss' ? 'selected' : ''}>Let's discuss</option>
          </select>
        </div>
        <div class="form-group">
          <label for="editStatus">Status</label>
          <select id="editStatus">
            <option value="new" ${(submission.status || 'new') === 'new' ? 'selected' : ''}>New</option>
            <option value="in-progress" ${(submission.status || 'new') === 'in-progress' ? 'selected' : ''}>In Progress</option>
            <option value="completed" ${(submission.status || 'new') === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="archived" ${(submission.status || 'new') === 'archived' ? 'selected' : ''}>Archived</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label for="editMessage">Message</label>
        <textarea id="editMessage" rows="4">${submission.message || ''}</textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeEditModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Save Changes</button>
      </div>
    </form>
  `;
  
  document.getElementById('editModalTitle').textContent = 'Edit Submission';
  document.getElementById('editModalBody').innerHTML = editHTML;
  document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

function viewSubmissionDetail(id) {
  console.log('viewSubmissionDetail called with id:', id);
  const submission = allSubmissions.find(s => s.id === id);
  if (!submission) {
    console.error('Submission not found:', id);
    showNotification('Submission not found', 'error');
    return;
  }
  
  const detailModal = document.getElementById('detailModal');
  if (!detailModal) {
    console.error('Detail modal not found');
    showNotification('Detail modal not available', 'error');
    return;
  }
  
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
          <label>Timeline:</label>
          <span>${getTimelineDisplayText(submission.timeline)}</span>
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
  console.log('deleteSubmission called with id:', id);
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
  console.log('emailSubmission called with id:', id);
  const submission = allSubmissions.find(s => s.id === id);
  if (!submission || !submission.email) {
    console.error('No submission or email found:', { submission, id });
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
  
  // EmailJS is already initialized at app startup
  console.log('Notifications ready - both email and browser alerts active!');
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
  // Your actual EmailJS credentials
  const SERVICE_ID = 'service_t0c4kpl';
  const TEMPLATE_ID = 'template_4e6fcsp';  
  const PUBLIC_KEY = 'iqnQ8hvdneETxCkEg';
  
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
  console.log('Navigate to page called:', page);
  appState.currentPage = page;
  renderCurrentPage();
  
  // Update active nav link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.style.color = link.getAttribute('data-page') === page ? 'var(--primary-color)' : 'var(--text-light)';
  });
}

// Make navigateToPage globally available
window.navigateToPage = navigateToPage;
window.navigateTo = navigateToPage; // Alias for backward compatibility

// Make firebaseService globally available for inline handlers
window.firebaseService = firebaseService;

// Make other necessary functions globally available
window.closeProjectsModal = closeProjectsModal;
window.editProfile = editProfile;
window.closeProfileModal = closeProfileModal;
window.viewProjects = viewProjects;
window.viewAllActivity = viewAllActivity;
window.downloadInvoices = downloadInvoices;
window.contactSupport = contactSupport;
window.changePassword = changePassword;
window.notificationSettings = notificationSettings;

// Make support ticket functions globally available
window.showSupportTicketActions = showSupportTicketActions;
window.closeSupportTicketActions = closeSupportTicketActions;
window.viewSupportTicketDetail = viewSupportTicketDetail;
window.emailSupportTicket = emailSupportTicket;
window.respondToSupportTicket = respondToSupportTicket;
window.editSupportTicket = editSupportTicket;
window.deleteSupportTicket = deleteSupportTicket;
window.saveSupportTicketEdit = saveSupportTicketEdit;

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

// Account functions
window.handleUserSignOut = handleUserSignOut;
window.editProfile = editProfile;
window.closeProfileModal = closeProfileModal;
window.viewAllActivity = viewAllActivity;
window.viewProjects = viewProjects;
window.downloadInvoices = downloadInvoices;
window.contactSupport = contactSupport;
window.changePassword = changePassword;
window.notificationSettings = notificationSettings;
window.billingSettings = billingSettings;
window.signInWithGoogle = signInWithGoogle;
window.signUpWithGoogle = signUpWithGoogle;
window.showForgotPassword = showForgotPassword;
