# Environment Variables for Cloudflare Pages

This document lists all environment variables that need to be configured in Cloudflare Pages for the RNDM Development website to function properly.

## Discord Webhooks

These webhooks are used to send form submissions to Discord channels:

### 1. VITE_DISCORD_WEBHOOK_INQUIRY
**Purpose:** Receives new project inquiry submissions  
**Value:** `https://discord.com/api/webhooks/1424569954086162523/S_lokH1FlYpK7s-oRfVpTiyyFwbizllmYOjPA3sNCsuvC4xFzDeE1tvnHOeEe4asMLZa`

### 2. VITE_DISCORD_WEBHOOK_SOS
**Purpose:** Receives SOS requests for existing projects (issues/changes)  
**Value:** `https://discord.com/api/webhooks/1424570218709127218/keZqpkVRgKoYMGMwH0mC-OZcJtsB1i8RbMy0UPTDKMOgf-oSodHrk8d5oWaF68XSRslz`

### 3. VITE_DISCORD_WEBHOOK_INVOICE
**Purpose:** Receives invoice request notifications  
**Value:** `https://discord.com/api/webhooks/1424574371640508438/LbyHEhNyEslOluhXqMBSuOkwZ2QiUNeFeMWhl3ri-mbeFkjh1X3l3m4Lw82SmY6PjHvI`

---

## Firebase Configuration

Your Firebase configuration is already in `src/firebase-config.js`. These values do NOT need to be environment variables as they are public-facing configuration values.

**Current Firebase Config Location:** `src/firebase-config.js`

---

## How to Set Up in Cloudflare Pages

1. Go to your Cloudflare Pages project
2. Navigate to **Settings** > **Environment variables**
3. Add each variable above:
   - Variable name: (e.g., `VITE_DISCORD_WEBHOOK_INQUIRY`)
   - Value: (paste the full webhook URL)
   - Environment: Select **Production** and **Preview** (or both)
4. Click **Save**
5. Redeploy your site for changes to take effect

---

## Build Settings for Cloudflare Pages

**Build command:** `npm run build`  
**Build output directory:** `dist`  
**Node version:** 18 or higher

---

## Security Notes

- ⚠️ **Never commit `.env.local` to git** - it's already in `.gitignore`
- ⚠️ **Webhook URLs should only be stored in Cloudflare** or `.env.local` for local development
- ✅ All webhook URLs in `.env.local` are for your reference to copy to Cloudflare
- ✅ Firebase config values in `firebase-config.js` are safe to commit (they're public)

---

## Local Development

For local development, the webhooks will be loaded from `.env.local` file automatically by Vite.

**Do not delete `.env.local` until after you've copied the values to Cloudflare!**

---

## Testing

After setting up environment variables in Cloudflare:

1. Deploy the site
2. Go to the contact page
3. Sign up for an account
4. Submit a test inquiry
5. Check your Discord channel for the webhook message

---

## Troubleshooting

**Forms submit but no Discord notification:**
- Check that environment variables are set in Cloudflare
- Verify webhook URLs are correct
- Check Discord webhook channel settings

**"Configuration error" when submitting forms:**
- Environment variables are not set or have wrong names
- Rebuild and redeploy after adding variables

---

Last Updated: October 6, 2025
