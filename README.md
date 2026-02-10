# RNDM Development - Full Stack Application

A modern, feature-rich web application for managing project inquiries and client submissions. Built with React, TypeScript, Redux, Firebase, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- ✨ **Contact Form** - Professional inquiry submission with validation
- 🔐 **Authentication** - Firebase Auth with email/password and Google OAuth
- 📊 **Admin Dashboard** - Real-time submission tracking and management
- 📧 **Email Notifications** - Automated confirmation and admin emails via EmailJS
- 🔒 **reCAPTCHA** - Bot protection for form submissions
- 🌙 **Dark Mode** - Theme switching with persistence

### Technical Features
- ⚡ **Vite** - Lightning-fast build tool and dev server
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📦 **Redux Toolkit** - State management
- 🔥 **Firebase** - Real-time database and authentication
- ✅ **TypeScript** - Full type safety
- 🧪 **Jest** - Comprehensive testing (60+ tests)
- 📱 **Responsive** - Mobile-first design
- ♿ **Accessible** - WCAG compliant components

## 📋 Prerequisites

- Node.js 18+ or 20+
- npm or yarn
- Firebase project (free tier available)
- EmailJS account (free tier available)
- Google reCAPTCHA site key

## 🛠️ Setup

### 1. Clone the Repository
```bash
git clone https://github.com/RNDMJUNKLLC/rndmdevelopment.git
cd rndmdevelopment
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Copy example file
cp .env.example .env.local

# Edit with your credentials
# - Firebase config
# - reCAPTCHA site key
# - EmailJS credentials
```

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 📖 Available Scripts

### Development
```bash
npm run dev          # Start dev server
npm run type-check   # Check TypeScript errors
npm run build        # Production build
npm run preview      # Preview prod build
```

### Testing
```bash
npm test            # Run all tests
npm run test:watch  # Watch mode
npm run test:coverage # Coverage report
```

### Analysis
```bash
npm run build:analyze # Bundle analysis
npm run analyze:performance # Performance profiling
```

## 📁 Project Structure

```
src/
├── components/
│   ├── forms/          # Form components
│   ├── layout/         # Layout components (Navigation, Footer)
│   ├── pages/          # Page components
│   ├── admin/          # Admin components
│   └── ui/             # Reusable UI components
├── hooks/
│   ├── useAuth.ts      # Authentication hook
│   ├── useDatabase.ts  # Database operations
│   ├── useEmail.ts     # Email sending
│   └── useRecaptcha.ts # reCAPTCHA integration
├── services/
│   ├── firebase/       # Firebase configuration
│   ├── email/          # Email service
│   └── recaptcha/      # reCAPTCHA service
├── store/
│   ├── slices/         # Redux slices
│   └── index.ts        # Store configuration
├── utils/
│   ├── formUtils.ts    # Form utilities
│   ├── formValidation.ts # Validation logic
│   └── errorHandling.ts # Error handling
├── types/
│   └── index.ts        # TypeScript types
└── __tests__/
    ├── components/     # Component tests
    └── utils/          # Utility tests
```

## 🔧 Configuration

### Firebase Setup
1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database (Start in test mode)
3. Enable Authentication (Email/Password + Google)
4. Copy credentials to `.env.local`

### EmailJS Setup
1. Create account at [EmailJS](https://www.emailjs.com)
2. Set up email templates
3. Add Service ID, Template ID, and Public Key to `.env.local`

### reCAPTCHA Setup
1. Get keys from [Google reCAPTCHA Console](https://www.google.com/recaptcha/admin)
2. Use v3 or v2 checkbox
3. Add site key to `.env.local`

## 🧪 Testing

The project includes comprehensive test coverage:

- **Unit Tests**: Utility functions and helpers (45+ tests)
- **Component Tests**: Form, Navigation, Footer components

Run tests:
```bash
npm test              # Run all tests
npm run test:watch    # Watch for changes
npm run test:coverage # Generate coverage report
```

## 📊 Performance

- **Bundle Size**: ~147 KB gzipped
- **Load Time**: < 2 seconds
- **Lighthouse Score**: 90+
- **Web Vitals**: FCP < 1.5s, LCP < 2.5s

See [PERFORMANCE.md](docs/PERFORMANCE.md) for optimization details.

## 🚀 Deployment

Multiple deployment options available:

- **Vercel** (Recommended) - Zero-config deployment
- **Netlify** - Simple CI/CD integration
- **Docker** - Containerized deployment
- **Cloud Run** - Google Cloud serverless
- **Traditional Server** - Nginx/Apache hosting

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## 🔒 Security Features

- ✅ HTTPS/SSL encryption
- ✅ Content Security Policy (CSP)
- ✅ CSRF protection via reCAPTCHA
- ✅ XSS prevention
- ✅ SQL injection protection (Firebase rules)
- ✅ Secure headers configuration
- ✅ Environment variable protection

## 📚 Documentation

- [PERFORMANCE.md](docs/PERFORMANCE.md) - Performance optimization guide
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Comprehensive deployment guide

## 🔄 CI/CD

GitHub Actions workflow included:
- Automated testing on push
- Type checking
- Build verification
- Coverage reporting
- Automated deployment to production

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0** - UI library
- **TypeScript 5.3** - Type safety
- **Tailwind CSS 3.4** - Styling
- **Redux Toolkit 1.9** - State management

### Backend Services
- **Firebase 11.10** - Database & Auth
- **EmailJS 4.4** - Email service
- **Google reCAPTCHA v3** - Bot protection

### Development Tools
- **Vite 7.0** - Build tool
- **Jest** - Testing framework
- **React Testing Library** - Component testing

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

Please ensure:
- Code passes linting: `npm run type-check`
- Tests pass: `npm test`
- No console errors

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

For issues or questions:
1. Check existing GitHub issues
2. Review documentation in `/docs`
3. Create new issue with detailed description

## 📞 Contact

**RNDM Development**
- Website: [rndm.dev](https://www.rndm.dev)
- Email: info@rndm.dev
- GitHub: [@RNDMJUNKLLC](https://github.com/RNDMJUNKLLC)

---

**Made with ❤️ by RNDM Development**

Last Updated: February 2026

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
