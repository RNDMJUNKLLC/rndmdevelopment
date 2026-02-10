# Architecture Overview

This document describes the overall architecture and design patterns used in the RNDM Development application.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser / Client                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   React Application                    │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │           UI Components Layer                    │  │ │
│  │  │  - Pages (Home, About, Services, Contact, etc)  │  │ │
│  │  │  - Forms (ContactForm, LoginForm)               │  │ │
│  │  │  - Layout (Navigation, Footer)                  │  │ │
│  │  │  - Admin (Dashboard, Submissions)               │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                        ▲                                 │ │
│  │                        │                                 │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │        Redux State Management Layer              │  │ │
│  │  │  - UI Slice (currentPage, isDarkMode, etc)      │  │ │
│  │  │  - Auth Slice (user, isLoggedIn)                │  │ │
│  │  │  - Notification Slice                            │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                        ▲                                 │ │
│  │                        │                                 │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │           Custom Hooks Layer                     │  │ │
│  │  │  - useAuth (authentication)                      │  │ │
│  │  │  - useDatabase (Firestore operations)           │  │ │
│  │  │  - useEmail (EmailJS)                           │  │ │
│  │  │  - useRecaptcha (reCAPTCHA)                     │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                        ▲                                 │ │
│  │                        │                                 │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │         Services & Utilities Layer               │  │ │
│  │  │  - Firebase Config & Services                    │  │ │
│  │  │  - Form Validation                               │  │ │
│  │  │  - Error Handling                                │  │ │
│  │  │  - Form Utilities                                │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                        ▲  ▲  ▲                               │
└─────────────────────────────────────────────────────────────┘
                         │  │  │
          ┌──────────────┘  │  └──────────────┐
          │                 │                 │
    ┌─────▼──┐       ┌──────▼──────┐     ┌────▼──────┐
    │Firebase │       │  EmailJS    │     │ reCAPTCHA │
    │         │       │             │     │           │
    │ - Auth  │       │ - Send      │     │ - Execute │
    │ - DB    │       │   Emails    │     │ - Verify  │
    │ - Rules │       │             │     │           │
    └─────────┘       └─────────────┘     └───────────┘
```

## Core Components

### 1. UI Components (`src/components/`)

#### Layout
- **Navigation**: Main navigation bar with dark mode toggle and auth links
- **Footer**: Footer with company info and links

#### Pages
- **Home**: Landing page with intro and CTA
- **About**: Company information
- **Services**: Service offerings
- **Contact**: Full contact form
- **Token**: Token management page
- **Account**: User account management

#### Forms
- **ContactForm**: Main inquiry form with validation
- **LoginForm**: User authentication form

#### Admin
- **AdminDashboard**: Real-time submission overview
- **SubmissionTable**: Submissions list with sorting/filtering
- **SubmissionDetail**: Individual submission view

#### UI
- **NotificationContainer**: Toast notifications
- **Modal**: Reusable modal component
- **Loading**: Loading state indicator

### 2. State Management (`src/store/`)

#### Redux Slices

**UI Slice** (`uiSlice.ts`)
- `currentPage`: Currently active page
- `isDarkMode`: Dark mode enabled/disabled
- `isMenuOpen`: Mobile menu state
- `notifications`: Active notifications

**Auth Slice** (`authSlice.ts`)
- `user`: Current user object
- `isLoggedIn`: Authentication status
- `isLoading`: Auth operation status
- `error`: Auth error message

### 3. Custom Hooks (`src/hooks/`)

#### useAuth
- Authentication state and methods
- Login/logout/register functionality
- Password reset
- Profile updates

#### useDatabase
- Firestore CRUD operations
- Real-time listener subscriptions
- Query building
- Error handling

#### useEmail
- EmailJS integration
- Send confirmation emails
- Send admin notifications

#### useRecaptcha
- reCAPTCHA v3 execution
- Token verification
- Error handling

### 4. Services (`src/services/`)

#### Firebase Service
- **Config**: Firebase initialization
- **Auth**: Authentication methods
- **Database**: Firestore operations
- **Rules**: Security rule definitions

#### Email Service
- EmailJS initialization
- Template management
- Bulk email sending

#### reCAPTCHA Service
- Script loading
- Token generation
- Verification logic

### 5. Utilities (`src/utils/`)

#### Form Validation
- Email validation
- Phone number validation
- Required field checking
- Custom validators

#### Form Utilities
- Form submission handling
- CSV export
- Data formatting
- Notification creation

#### Error Handling
- Firebase error mapping
- User-friendly error messages
- Error logging
- Recovery strategies

## Data Flow

### Contact Form Submission
```
1. User fills form → ContactForm component
2. Form validation → formValidation.ts
3. reCAPTCHA check → useRecaptcha hook
4. Save to Firestore → useDatabase hook
5. Send confirmation email → useEmail hook
6. Update Redux state → Notification displayed
7. Admin receives email → EmailJS
8. Admin Dashboard updates → Real-time listener
```

### User Authentication
```
1. User enters credentials → LoginForm
2. Firebase Auth → useAuth hook
3. Create/retrieve user document → useDatabase hook
4. Update Redux state → Auth slice
5. Redirect to authenticated page → App router
6. Store auth token → localStorage
```

### Real-time Dashboard Updates
```
1. Admin opens Dashboard
2. Subscribe to submissions → useDatabase + Firestore listener
3. Data updates in real-time → Submission component re-renders
4. Admin updates submission status → Firestore update
5. Update distributed to all connected clients → Real-time sync
```

## Database Schema

### Submissions Collection
```typescript
{
  id: string;           // Auto-generated
  name: string;
  email: string;
  company: string;
  projectType: string;
  budget: string;
  timeline: string;
  message: string;
  phone?: string;
  status: 'pending' | 'viewed' | 'responded';
  timestamp: number;
  userId?: string;      // Admin who last updated
}
```

### Users Collection
```typescript
{
  id: string;           // Firebase UID
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'user';
  createdAt: number;
  lastLogin: number;
}
```

## Authentication Flow

1. **Sign Up** → Firebase Auth → Create user document → Set role
2. **Sign In** → Firebase Auth → Verify credentials → Load user data
3. **Sign Out** → Clear auth state → Clear localStorage → Redirect
4. **Google Auth** → OAuth → Create/update user → Load profile

## Security Architecture

### Client-Side
- Environment variables for sensitive keys
- Input validation and sanitization
- CSRF tokens for forms
- XSS prevention via React escaping

### Server-Side (Firebase)
- Firestore security rules based on roles
- Auth state verification
- Server-side validation
- Audit logging

### External Services
- reCAPTCHA for bot protection
- EmailJS API for verified emails
- OAuth providers for authentication

## Error Handling Strategy

```
Error
  ↓
Catch (try-catch, promise.catch)
  ↓
Classify (Firebase error, validation, network, etc)
  ↓
Format (User-friendly message)
  ↓
Display (Toast notification or error state)
  ↓
Log (Console in dev, externally in prod)
  ↓
Recover (Retry, fallback, disable feature)
```

## Performance Optimizations

### Code Splitting
- Route-based lazy loading
- Component-level code splitting
- Dynamic imports for heavy libraries

### Caching
- Browser cache for static assets
- Firebase offline persistence
- LocalStorage for user preferences

### Rendering
- React.memo for expensive components
- useCallback for event handlers
- useMemo for computed values
- Redux selector optimization

## Testing Architecture

### Unit Tests
- Utility functions
- Validation logic
- Error handling

### Component Tests
- Form rendering
- User interactions
- State updates
- Props handling

### Integration Tests
- Redux integration
- Firebase hooks
- Full form submission

## Deployment Architecture

```
Source Code (GitHub)
        ↓
    Commit
        ↓
GitHub Actions (CI/CD)
  - Lint & Type Check
  - Run Tests
  - Build Project
        ↓
    Deploy (Vercel/Docker/etc)
        ↓
    Production
```

## Hosting Options

1. **Vercel** (Recommended)
   - Automatic deployments from GitHub
   - Serverless functions optional
   - Analytics included
   - Edge network for speed

2. **Docker**
   - Container-based deployment
   - Production-ready image
   - Multi-stage build
   - Environment variable support

3. **Traditional Server**
   - Nginx/Apache hosting
   - Full control
   - Higher maintenance
   - Cost-effective for high traffic

## Monitoring & Observability

### Metrics to Track
- Page load time
- Form submission success rate
- Error rates
- User authentication success
- Email delivery rate

### Tools Recommended
- Google Analytics for user behavior
- Sentry for error tracking
- Firebase Analytics for app events
- LogRocket for session recording

## Future Improvements

1. **Service Workers** for offline support
2. **GraphQL** for more efficient data fetching
3. **API** backend for advanced features
4. **WebSockets** for real-time updates
5. **Microservices** for scalability
6. **Caching Layer** (Redis) for performance
7. **Message Queue** (RabbitMQ) for async tasks

---

**This architecture provides a scalable, maintainable, and performant foundation for the RNDM Development application.**
