# RNDM Development Website

A professional yet fun website for RNDM Development (RNDM DEVS) built with Vite and Firebase.

## Features

- **Modern Design**: Professional yet fun aesthetic with animated elements
- **Contact Form**: Firebase Realtime Database integration for form submissions
- **Admin Dashboard**: Password-protected admin panel to view submissions
- **Responsive Design**: Works great on all devices
- **Performance Optimized**: Lightning-fast loading with Vite
- **Static Deployment**: Perfect for Cloudflare Pages

## Setup Instructions

### 1. Firebase Configuration

1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable **Realtime Database** in test mode
3. Enable **Authentication** and set up Email/Password provider:
   - Go to Authentication > Sign-in method
   - Enable Email/Password provider
4. Go to Project Settings > General > Your apps
5. Copy your Firebase configuration
6. Replace the placeholder config in `src/firebase-config.js` with your actual config

### 2. Admin Account Setup

**Create Admin Account via Firebase Console:**
1. Go to your Firebase Console
2. Navigate to Authentication > Users
3. Click "Add user" 
4. Enter admin email and password
5. Save the user

**Admin Access:**
- Visit your website's admin page
- Sign in with the email and password you created in Firebase Console

**Optional: Restrict Admin Access**
- In `src/firebase-config.js`, add allowed admin emails to `adminConfig.allowedAdminEmails`
- Only users with these emails will be able to access the admin panel

### 2. Local Development

```bash
npm install
npm run dev
```

### 3. Build for Production

```bash
npm run build
```

### 4. Deploy to Cloudflare Pages

1. Build the project: `npm run build`
2. Upload the `dist` folder to Cloudflare Pages
3. Set build command: `npm run build`
4. Set build output directory: `dist`

## Admin Access

**Firebase Authentication:** The admin panel uses Firebase Authentication for secure access.

**Admin Setup via Firebase Console:**
1. Go to Firebase Console > Authentication > Users
2. Click "Add user" to create admin account
3. Enter admin email and secure password
4. Sign in on your website with these credentials

**Security Features:**
- Secure Firebase Authentication
- Admin accounts created via Firebase Console only
- Optional email whitelist in config
- Proper session management

## Project Structure

```
src/
├── main.js              # Main application logic
├── style.css            # Styling with animations
├── firebase-config.js   # Firebase configuration
└── firebase-service.js  # Firebase database operations
```

## Features

- 🚀 **Lightning Fast**: Built with Vite for optimal performance
- 🎨 **Animated UI**: Cool glitch effects and smooth animations
- 📱 **Responsive**: Works perfectly on all devices
- 🔒 **Secure Admin Panel**: Firebase Authentication with email/password
- 🔥 **Firebase**: Real-time database for form submissions
- ☁️ **Static Hosting**: Perfect for Cloudflare Pages deployment

---

Built with ❤️ by RNDM Development
