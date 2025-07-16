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
2. Enable Realtime Database in test mode
3. Go to Project Settings > General > Your apps
4. Copy your Firebase configuration
5. Replace the placeholder config in `src/firebase-config.js` with your actual config

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

Default admin password: `rndmdev2025`

You can change this in `src/main.js` in the `appState.adminPassword` property.

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
- 🔒 **Admin Panel**: Secure dashboard for viewing submissions
- 🔥 **Firebase**: Real-time database for form submissions
- ☁️ **Static Hosting**: Perfect for Cloudflare Pages deployment

---

Built with ❤️ by RNDM Development
