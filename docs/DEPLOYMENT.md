# Deployment Guide

This guide covers deploying the RNDM Development application to various platforms.

## Prerequisites

- Node.js 18+ or Docker
- Git
- Environment variables configured (see `.env.example`)

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Type checking
npm run type-check
```

## Building for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run build:analyze
```

## Deployment Options

### Option 1: Static Hosting (Vercel, Netlify, GitHub Pages)

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Or with environment variables
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_PROJECT_ID
vercel deploy
```

**Configuration**: Add `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_FIREBASE_API_KEY": "@vite_firebase_api_key",
    "VITE_FIREBASE_PROJECT_ID": "@vite_firebase_project_id"
  }
}
```

#### Netlify

1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy

#### GitHub Pages

```bash
# Build
npm run build

# Deploy to gh-pages branch
git subtree push --prefix dist origin gh-pages
```

### Option 2: Docker Deployment

#### Build Docker Image

```bash
# Build image
docker build -t rndm-app:latest .

# Run container
docker run -p 3000:3000 \
  -e VITE_FIREBASE_PROJECT_ID=your_project_id \
  -e VITE_RECAPTCHA_SITE_KEY=your_site_key \
  rndm-app:latest

# Using docker-compose
docker-compose up -d
```

#### Docker Registry (Docker Hub, ECR, etc.)

```bash
# Tag image
docker tag rndm-app:latest yourusername/rndm-app:latest

# Push to registry
docker push yourusername/rndm-app:latest
```

### Option 3: Cloud Platform Deployment

#### Google Cloud Run

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Build and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/rndm-app

# Deploy
gcloud run deploy rndm-app \
  --image gcr.io/YOUR_PROJECT_ID/rndm-app \
  --platform managed \
  --region us-central1 \
  --set-env-vars VITE_FIREBASE_PROJECT_ID=your_project_id
```

#### AWS Elastic Beanstalk

```bash
# Initialize EB
eb init -p "Node.js 18 running on 64bit Amazon Linux 2" rndm-app

# Configure .ebextensions/nodecommand.config
# Create .env file with variables

# Deploy
eb create rndm-app-env
eb deploy
```

### Option 4: Traditional Server (Nginx, Apache)

#### Setup

1. Build the application: `npm run build`
2. Upload `dist` folder to server
3. Configure web server

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Root directory
    root /var/www/rndm-app/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/javascript;

    # Cache control
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # HTML cache
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public, max-age=3600";
    }

    # SPA routing - fallback to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

## Environment Variables

Set environment variables based on your deployment platform:

```bash
VITE_FIREBASE_API_KEY
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_RECAPTCHA_SITE_KEY
VITE_EMAILJS_SERVICE_ID
VITE_EMAILJS_TEMPLATE_ID
VITE_EMAILJS_PUBLIC_KEY
```

## Security Checklist

- [ ] Enable HTTPS/SSL
- [ ] Set secure CORS headers
- [ ] Configure CSP (Content Security Policy)
- [ ] Set security headers (X-Frame-Options, X-Content-Type-Options)
- [ ] Enable gzip compression
- [ ] Set appropriate cache headers
- [ ] Remove source maps in production
- [ ] Enable error logging/monitoring
- [ ] Implement rate limiting
- [ ] Regular security audits

## Performance Optimization

- ✅ Gzip compression enabled
- ✅ CSS/JS minification enabled
- ✅ Image optimization recommended
- ✅ CDN integration recommended
- ✅ Browser caching configured

## Monitoring & Observability

### Health Check Endpoint
```bash
GET /index.html
```

### Logging
- Browser console logs (development)
- Server-side logging recommended for production
- Error tracking service (Sentry, etc.)

### Metrics
- Page load times
- Core Web Vitals
- Error rates
- User analytics

## Rollback Procedure

1. **Vercel/Netlify**: Automatic rollback available in deployment history
2. **Docker**: Deploy previous image version
3. **Server**: Keep backup of previous build
4. **GitHub**: Revert commit and redeploy

## Troubleshooting

### Build Issues
- Clear cache: `rm -rf node_modules dist && npm install`
- Check Node version: `node --version` (should be 18+)
- Verify environment variables are set

### Runtime Issues
- Check browser console for errors (F12)
- Verify Firebase configuration
- Check network tab for failed requests
- Review server logs for errors

### Performance Issues
- Check bundle size: `npm run analyze:bundle`
- Profile with Chrome DevTools
- Monitor Core Web Vitals
- Review server response times

## Useful Commands

```bash
# Build and preview production
npm run build && npm run preview

# Check TypeScript errors
npm run type-check

# Run tests
npm test

# Analyze bundle
npm run analyze:performance
```

## Further Resources

- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Web Security Best Practices](https://owasp.org/www-project-secure-coding-practices/)
