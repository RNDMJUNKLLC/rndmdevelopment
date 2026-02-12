# Cloudflare Pages Configuration Guide

## Critical Changes for SPA Deployment

Your new React application has **different requirements** than static HTML. Here's what has been set up:

## 1. ✅ SPA Routing (_redirects file)

The `_redirects` file handles the most critical issue: **React Router routing**

**Issue**: In your old static site, each `/page.html` file was served directly. Now, React needs to catch ALL routes and process them on the client side.

**Solution**: The `_redirects` file rewrites ALL requests to `/index.html` with status 200 (not a redirect). React Router then matches the URL and renders the correct component.

```
/*    /index.html   200
```

This is **REQUIRED** for:
- `/about`, `/services`, `/contact` to work
- Internal routing to function properly
- Page refreshes to not result in 404s

## 2. ✅ Security Headers (_headers file)

Sets up security headers and caching rules:

**Caching Strategy:**
- `/assets/*` - **1 year** (immutable, includes hash in filename)
- `/*.js, *.css` - **1 hour** (will update when rebuilt)
- `/images/*` - **7 days**
- `/*.html` - **No cache** (forces fresh checks)

**Security Headers:**
- `X-Content-Type-Options: nosniff` - Prevent MIME type sniffing
- `X-Frame-Options: SAMEORIGIN` - Prevent clickjacking
- `Strict-Transport-Security` - Enforce HTTPS
- `Content-Security-Policy` - Control which resources can load
- `Referrer-Policy` - Privacy control

## 3. ✅ GitHub Actions Workflow (.github/workflows/deploy-cloudflare.yml)

**Replaces** the generic `ci-cd.yml` deployment step with **Cloudflare-specific action**:

```yaml
- uses: cloudflare/pages-action@v1
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    projectName: rndmdevelopment
    directory: dist
    productionBranch: forked-main
```

This automatically:
- Builds the `dist` folder
- Deploys to Cloudflare Pages
- Creates preview builds for Pull Requests
- Deploys to production on `forked-main` push

## 4. ✅ Vite Build Output

Your current `vite.config.js` already builds to `dist/` which is correct:

```javascript
build: {
  outDir: 'dist',      // ✓ Cloudflare expects this
  sourcemap: false,    // ✓ Production-ready
  minify: 'esbuild',   // ✓ Performance optimized
}
```

## Setup Instructions

### Step 1: Add Cloudflare Secrets to GitHub

Go to your repository:
- **Settings → Secrets and variables → Actions**
- Add these **Repository secrets**:

```
CLOUDFLARE_API_TOKEN      = [Your Cloudflare API token with Pages Admin scope]
CLOUDFLARE_ACCOUNT_ID     = [Your Cloudflare Account ID]
```

**How to get them:**

1. **Cloudflare Account ID**:
   - Go to https://dash.cloudflare.com
   - Copy "Account ID" from the right sidebar
   - Format: 32-character alphanumeric string

2. **API Token**:
   - https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Use template: "Edit Cloudflare Workers"
   - Grant permissions: `Account.Cloudflare Pages:Edit`
   - Copy the token immediately (won't show again)

### Step 2: Create Cloudflare Pages Project (if not exists)

- Go to https://dash.cloudflare.com → Pages
- Click "Create a project"
- Connect your GitHub repository
- Framework preset: **React**
- Build command: `npm run build`
- Build output directory: `dist`
- Click "Save and Deploy"

### Step 3: Push to Trigger Deployment

```bash
git add .
git commit -m "Add Cloudflare Pages configuration"
git push origin forked-main
```

GitHub Actions will:
1. Run tests ✓
2. Build the app ✓
3. Deploy to Cloudflare Pages ✓

## Key Differences from Static Site

| Feature | Old Static | New React SPA |
|---------|-----------|---------------|
| Routing | Direct file serving | React Router in browser |
| Build | None needed | `npm run build` → dist/ |
| Deployment | Upload HTML files | Upload bundle + redirect rules |
| Caching | File-based | Asset hash-based |
| Redirects | Not needed | **REQUIRED** for SPA |
| Build time | ~instant | ~2-5 seconds |

## Cloudflare-Specific Advantages

✅ **Edge caching** - CDN servers globally distribute your app
✅ **Free tier available** - Includes basic Pages hosting
✅ **GitHub integration** - Auto-deploys on push
✅ **Preview deployments** - PR previews before merging
✅ **DDoS protection** - Built-in security
✅ **SSL/TLS** - Free HTTPS with automatic renewal

## Files Created/Modified

### New Files:
- `wrangler.toml` - Cloudflare Workers/Pages config
- `_redirects` - SPA routing rules
- `_headers` - Security headers and caching
- `.github/workflows/deploy-cloudflare.yml` - Deployment automation

### What to Delete:
- **Optional**: You can keep `ci-cd.yml` for additional testing on other platforms, or remove it if Cloudflare is your only deployment.

## Verification

After first deployment, verify:

1. **Routes work**: Visit `https://yourdomain.com/about`, `/services`, `/contact`
2. **Page refresh works**: Hard refresh (Ctrl+Shift+R) on any route shouldn't 404
3. **Assets load**: Check DevTools → Network tab for cached assets
4. **Security headers**: Use https://securityheaders.com/ to check headers
5. **Performance**: Check Lighthouse score in DevTools

## Troubleshooting

**Problem**: Routes return 404
- **Solution**: Verify `_redirects` file is in root and has `/* /index.html 200`

**Problem**: Resources (CSS/JS) not loading
- **Solution**: Check `vite.config.js` has correct `base` path (should be `/` for root domain)

**Problem**: Deployment fails
- **Solution**: Check GitHub Actions logs, verify Cloudflare API token has correct permissions

**Problem**: Old cached content showing
- **Solution**: Purge Cloudflare cache (Dashboard → Caching → Purge Cache)

## Next Steps

1. ✅ Copy secrets to GitHub (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)
2. ✅ Verify Cloudflare Pages project exists
3. ✅ Push changes to trigger first deployment
4. ✅ Test all routes after deployment
5. ✅ Monitor error logs for first 24 hours

Your app is now **production-ready for Cloudflare Pages!** 🚀
