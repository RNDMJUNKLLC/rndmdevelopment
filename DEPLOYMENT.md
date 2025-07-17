# Cloudflare Pages Deployment

## Build Configuration

**Build command:** `npm run build`
**Build output directory:** `dist`
**Root directory:** `/` (default)

## Environment Variables

Make sure to set up your Firebase configuration in the Cloudflare Pages dashboard:

1. Go to your Cloudflare Pages project
2. Navigate to Settings > Environment variables
3. Add your Firebase config values (optional - they're already in the code)

## Deployment Steps

### Option 1: Git Integration (Recommended)
1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set build output directory: `dist`
4. Deploy automatically on push

### Option 2: Direct Upload
1. Run `npm run build` locally
2. Upload the `dist` folder to Cloudflare Pages
3. Or use `npx wrangler pages deploy dist` for CLI deployment

## Notes

- This is a **static site** (Vite build), not a Cloudflare Worker
- Use **Cloudflare Pages**, not Cloudflare Workers
- The `dist` folder contains all the built assets
- Firebase handles all the backend functionality
