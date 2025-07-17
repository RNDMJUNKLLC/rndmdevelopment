# 🚀 RNDM Development Email Notifications Setup Guide

Your website now has **both browser notifications AND email notifications** set up! Here's how to activate the email notifications:

## 📧 EmailJS Configuration (5-minute setup)

### Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

### Step 2: Create Email Service
1. In your EmailJS dashboard, click "Email Services"
2. Click "Add New Service"
3. Choose your email provider:
   - **Gmail** (recommended for personal)
   - **Outlook** (Microsoft accounts)
   - **Yahoo** (Yahoo accounts)
   - **Or any other provider**
4. Follow the connection steps for your provider
5. **Copy your Service ID** (you'll need this later)

### Step 3: Create Email Template
1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use this template content:

```html
Subject: New Contact Form Submission 🚀

From: {{from_name}}
Reply-To: {{client_email}}

📋 NEW SUBMISSION DETAILS:

Name: {{client_name}}
Email: {{client_email}}
Company: {{client_company}}
Project Type: {{project_type}}
Budget: {{budget_range}}
Date: {{submission_date}}

💬 MESSAGE:
{{submission_message}}

🔗 View in admin dashboard: {{dashboard_link}}

---
This email was sent automatically by your RNDM Development website.
```

4. Save the template and **copy your Template ID**

### Step 4: Get Your Public Key
1. Go to "Account" in your EmailJS dashboard
2. Find your **Public Key** (starts with "user_" or similar)
3. Copy this key

### Step 5: Configure Your Website
1. Open your project file: `src/main.js`
2. Find this section around line 976:

```javascript
// Initialize EmailJS service
function initializeEmailJS() {
  // TODO: Replace these with your actual EmailJS credentials
  const SERVICE_ID = 'YOUR_SERVICE_ID';        // Replace with your Service ID
  const TEMPLATE_ID = 'YOUR_TEMPLATE_ID';      // Replace with your Template ID  
  const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';        // Replace with your Public Key
```

3. Replace the placeholder values:

```javascript
// Initialize EmailJS service
function initializeEmailJS() {
  const SERVICE_ID = 'service_abc123';         // Your actual Service ID
  const TEMPLATE_ID = 'template_xyz789';       // Your actual Template ID  
  const PUBLIC_KEY = 'user_def456ghi';         // Your actual Public Key
```

4. **IMPORTANT**: In the email service file `src/email-service.js`, update line 28:

```javascript
to_email: 'your-email@example.com',  // Replace with YOUR actual email address
```

Change it to:
```javascript
to_email: 'youremail@gmail.com',     // Your actual email where you want notifications
```

### Step 6: Test Your Setup
1. Save all files and rebuild your project:
```bash
npm run build
```

2. Go to your admin panel and log in
3. Click the "📧 Test Email" button
4. Check your email inbox (and spam folder)

## 🎯 What You'll Get

✅ **Browser Notifications**: Desktop alerts when you're logged into admin  
✅ **Email Notifications**: Email alerts sent to your inbox for every new submission  
✅ **Instant Alerts**: Get notified immediately when someone contacts you  
✅ **Detailed Info**: Full submission details in both notifications  

## 📱 How It Works

1. **Someone submits your contact form**
2. **Browser notification** appears if you're logged into admin
3. **Email notification** is sent to your configured email address
4. **Both notifications** include full submission details
5. **Links back** to your admin dashboard for easy management

## 🔧 Advanced Features

### Multiple Email Recipients
To send notifications to multiple emails, modify the email service:

```javascript
to_email: 'admin@rndmdev.com,team@rndmdev.com',  // Multiple emails separated by commas
```

### Custom Email Templates
You can create different templates for different project types or customize the email design with HTML in your EmailJS template.

### Email Limits
- **Free plan**: 200 emails/month
- **Paid plans**: Start at $15/month for more emails
- Perfect for small to medium businesses

## 🆘 Troubleshooting

**Email not sending?**
1. Check your EmailJS credentials in `main.js`
2. Verify your email service connection in EmailJS dashboard
3. Check browser console for error messages
4. Try the test email button first

**Notifications not working?**
1. Allow browser notifications when prompted
2. Check if notifications are blocked in browser settings
3. Make sure you're logged into the admin panel

**Need help?**
The system will show console messages to help debug any issues. Check your browser's developer tools console for detailed error information.

## 🎉 You're All Set!

Once configured, you'll never miss a potential client inquiry again! Both desktop and email notifications will keep you instantly informed of new business opportunities.

Your RNDM Development admin panel is now a complete business management system with real-time notifications! 🚀
