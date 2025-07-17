import emailjs from '@emailjs/browser';

class EmailService {
  constructor() {
    this.serviceId = null;
    this.templateId = null;
    this.publicKey = null;
    this.initialized = false;
  }

  // Initialize EmailJS with your configuration
  init(serviceId, templateId, publicKey) {
    this.serviceId = 'service_t0c4kpl';
    this.templateId = 'template_4e6fcsp';
    this.publicKey = 'iqnQ8hvdneETxCkEg';
    
    // Initialize EmailJS
    emailjs.init(this.publicKey);
    this.initialized = true;
    
    console.log('EmailJS initialized successfully');
  }

  // Send email notification for new submission
  async sendNewSubmissionEmail(submission) {
    if (!this.initialized) {
      console.warn('EmailJS not initialized. Skipping email notification.');
      return { success: false, message: 'EmailJS not configured' };
    }

    try {
      const templateParams = {
        to_email: 'william@rndmdevs.com', // Replace with your email
        from_name: 'RNDM Development System',
        subject: 'New Contact Form Submission 🚀',
        
        // Submission details
        client_name: submission.name || 'Unknown',
        client_email: submission.email || 'Not provided',
        client_company: submission.company || 'Not provided',
        project_type: this.getProjectDisplayText(submission.project),
        budget_range: this.getBudgetDisplayText(submission.budget),
        submission_message: submission.message || 'No message provided',
        submission_date: new Date(submission.timestamp).toLocaleString(),
        
        // Admin dashboard link
        dashboard_link: `${window.location.origin}/#admin`,
        
        // Email body
        message: `
New contact form submission received!

📋 SUBMISSION DETAILS:
Name: ${submission.name || 'Unknown'}
Email: ${submission.email || 'Not provided'}
Company: ${submission.company || 'Not provided'}
Project Type: ${this.getProjectDisplayText(submission.project)}
Budget: ${this.getBudgetDisplayText(submission.budget)}
Date: ${new Date(submission.timestamp).toLocaleString()}

💬 MESSAGE:
${submission.message || 'No message provided'}

🔗 View in admin dashboard: ${window.location.origin}/#admin

---
This email was sent automatically by your RNDM Development website.
        `.trim()
      };

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );

      console.log('Email sent successfully:', response);
      return { 
        success: true, 
        message: 'Email notification sent successfully',
        response 
      };

    } catch (error) {
      console.error('Failed to send email:', error);
      return { 
        success: false, 
        message: 'Failed to send email notification',
        error 
      };
    }
  }

  // Helper method to get project display text
  getProjectDisplayText(value) {
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

  // Helper method to get budget display text
  getBudgetDisplayText(value) {
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

  // Test email function
  async sendTestEmail() {
    if (!this.initialized) {
      return { success: false, message: 'EmailJS not configured' };
    }

    const testSubmission = {
      name: 'Test User',
      email: 'test@example.com',
      company: 'Test Company',
      project: 'website',
      budget: '1k-2.5k',
      message: 'This is a test submission to verify email notifications are working correctly.',
      timestamp: Date.now()
    };

    return await this.sendNewSubmissionEmail(testSubmission);
  }
}

// Export singleton instance
export const emailService = new EmailService();
