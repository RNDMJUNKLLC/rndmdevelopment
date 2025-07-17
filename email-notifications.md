# Email & SMS Notification Setup Guide

## Option 1: EmailJS (Free, Easy Setup)

### Step 1: Set up EmailJS
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Create free account
3. Add email service (Gmail, Outlook, etc.)
4. Create email template
5. Get your User ID, Service ID, and Template ID

### Step 2: Install EmailJS
```bash
npm install @emailjs/browser
```

### Step 3: Add to Firebase Service
```javascript
import emailjs from '@emailjs/browser';

// In firebase-service.js
async submitContactForm(formData) {
  try {
    const newFormData = {
      ...formData,
      timestamp: Date.now(),
      dateSubmitted: new Date().toISOString()
    };
    
    await push(this.contactFormsRef, newFormData);
    
    // Send email notification
    await this.sendEmailNotification(newFormData);
    
    return { success: true, message: 'Form submitted successfully!' };
  } catch (error) {
    console.error('Error submitting form:', error);
    return { success: false, message: 'Failed to submit form. Please try again.' };
  }
}

async sendEmailNotification(submission) {
  try {
    await emailjs.send(
      'YOUR_SERVICE_ID',
      'YOUR_TEMPLATE_ID',
      {
        to_email: 'your-email@example.com',
        from_name: submission.name,
        from_email: submission.email,
        project_type: submission.project,
        budget: submission.budget,
        message: submission.message,
        company: submission.company || 'Not specified'
      },
      'YOUR_USER_ID'
    );
  } catch (error) {
    console.error('Email notification failed:', error);
  }
}
```

### Step 4: Email Template Example
```html
New Contact Form Submission! 🚀

Name: {{from_name}}
Email: {{from_email}}
Company: {{company}}
Project: {{project_type}}
Budget: {{budget}}

Message:
{{message}}

---
RNDM Development Admin System
```

## Option 2: Firebase Functions + Nodemailer

### Step 1: Set up Firebase Functions
```bash
npm install -g firebase-tools
firebase init functions
cd functions
npm install nodemailer
```

### Step 2: Create Cloud Function
```javascript
// functions/index.js
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password' // Use App Password for Gmail
  }
});

exports.sendNotificationEmail = functions.database.ref('/contact-forms/{submissionId}')
  .onCreate((snapshot, context) => {
    const submission = snapshot.val();
    
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: 'your-notification-email@gmail.com',
      subject: `New Contact Form Submission - ${submission.project}`,
      html: `
        <h2>New Contact Form Submission! 🚀</h2>
        <p><strong>Name:</strong> ${submission.name}</p>
        <p><strong>Email:</strong> ${submission.email}</p>
        <p><strong>Company:</strong> ${submission.company || 'Not specified'}</p>
        <p><strong>Project:</strong> ${submission.project}</p>
        <p><strong>Budget:</strong> ${submission.budget}</p>
        <p><strong>Message:</strong></p>
        <p>${submission.message}</p>
        <hr>
        <p><em>Submitted: ${new Date(submission.timestamp).toLocaleString()}</em></p>
      `
    };
    
    return transporter.sendMail(mailOptions);
  });
```

### Step 3: Deploy Function
```bash
firebase deploy --only functions
```

## Option 3: SMS Notifications with Twilio

### Step 1: Set up Twilio
1. Create Twilio account
2. Get Account SID, Auth Token, and Phone Number
3. Install Twilio SDK

### Step 2: Add to Firebase Functions
```javascript
const twilio = require('twilio');
const client = twilio('YOUR_ACCOUNT_SID', 'YOUR_AUTH_TOKEN');

exports.sendSMSNotification = functions.database.ref('/contact-forms/{submissionId}')
  .onCreate((snapshot, context) => {
    const submission = snapshot.val();
    
    return client.messages.create({
      body: `🚀 New contact form from ${submission.name} for ${submission.project}. Budget: ${submission.budget}`,
      from: '+1234567890', // Your Twilio number
      to: '+1987654321'    // Your phone number
    });
  });
```

## Option 4: Discord/Slack Webhooks (Free & Easy)

### Discord Webhook
```javascript
async function sendDiscordNotification(submission) {
  const webhook = 'YOUR_DISCORD_WEBHOOK_URL';
  
  const embed = {
    title: "🚀 New Contact Form Submission!",
    color: 0x00ffff,
    fields: [
      { name: "Name", value: submission.name, inline: true },
      { name: "Email", value: submission.email, inline: true },
      { name: "Project", value: submission.project, inline: true },
      { name: "Budget", value: submission.budget, inline: true },
      { name: "Message", value: submission.message.substring(0, 1000) }
    ],
    timestamp: new Date().toISOString()
  };
  
  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] })
  });
}
```

## Recommendation: Start Simple

1. **Browser Notifications** - Already implemented above
2. **EmailJS** - Easy setup, free tier
3. **Discord Webhook** - Great for team notifications
4. **Firebase Functions** - More control, requires billing

Choose based on your needs:
- Just you? → Browser notifications + EmailJS
- Team? → Discord/Slack webhooks
- Professional? → Firebase Functions + Nodemailer
