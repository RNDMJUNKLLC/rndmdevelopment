# reCAPTCHA Integration Setup Guide

This guide will help you set up Google reCAPTCHA v3 to protect your forms from spam and bot submissions.

## 🔧 Setup Steps

### 1. Get reCAPTCHA Credentials

1. **Visit Google reCAPTCHA Admin Console:**
   - Go to [https://www.google.com/recaptcha/admin/create](https://www.google.com/recaptcha/admin/create)
   - Sign in with your Google account

2. **Create a New Site:**
   - **Label:** Enter a name for your site (e.g., "RNDM Development Forms")
   - **reCAPTCHA type:** Select "reCAPTCHA v3"
   - **Domains:** Add your domains:
     - `localhost` (for development)
     - `127.0.0.1` (for local testing)
     - `your-production-domain.com` (your actual domain)
   - **Accept Terms:** Check the reCAPTCHA Terms of Service
   - Click **Submit**

3. **Copy Your Keys:**
   - **Site Key:** This is public and goes in your frontend code
   - **Secret Key:** This is private and should be used on your backend

### 2. Configure Your Application

1. **Update `src/firebase-config.js`:**
   ```javascript
   export const recaptchaConfig = {
     siteKey: "YOUR_ACTUAL_SITE_KEY_HERE", // Replace with your site key
     minimumScore: 0.5,
     enabled: true
   };
   ```

2. **Replace the placeholder:**
   - Find `YOUR_RECAPTCHA_SITE_KEY` in the config
   - Replace it with your actual site key from step 1

### 3. Backend Verification (Recommended)

For production use, you should verify reCAPTCHA tokens on your backend:

1. **Create an API endpoint** (example using Node.js/Express):
   ```javascript
   app.post('/api/verify-recaptcha', async (req, res) => {
     const { token, action } = req.body;
     const secretKey = 'YOUR_SECRET_KEY';
     
     const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
       method: 'POST',
       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
       body: `secret=${secretKey}&response=${token}`
     });
     
     const data = await response.json();
     
     if (data.success && data.score > 0.5) {
       res.json({ success: true, score: data.score });
     } else {
       res.json({ success: false, score: data.score });
     }
   });
   ```

2. **Update `src/recaptcha-service.js`:**
   - Uncomment the backend verification code in `verifyToken()`
   - Replace the simulated verification with actual API call

## ⚙️ Configuration Options

### Score Thresholds

reCAPTCHA v3 returns a score from 0.0 to 1.0:
- **1.0:** Very likely a human
- **0.5:** Neutral (default threshold)
- **0.0:** Very likely a bot

**Recommended thresholds:**
- **Strict (0.7):** For sensitive forms like payments
- **Moderate (0.5):** For general contact forms (current setting)
- **Lenient (0.3):** For newsletter signups

### Customization

You can customize the behavior in `src/firebase-config.js`:

```javascript
export const recaptchaConfig = {
  siteKey: "your-site-key",
  minimumScore: 0.5,           // Adjust threshold
  enabled: true,               // Enable/disable globally
  showBadge: true,             // Show "protected by reCAPTCHA" badge
  actions: {                   // Custom actions for different forms
    contact_form: 0.5,
    career_application: 0.6,
    support_ticket: 0.4
  }
};
```

## 🧪 Testing

### Development Testing

1. **Local Testing:**
   - Make sure `localhost` is added to your reCAPTCHA domains
   - Test form submissions in development mode
   - Check browser console for reCAPTCHA logs

2. **Visual Indicators:**
   - Forms should show "🔒 This form is protected by reCAPTCHA" badge
   - Submit buttons should show "Verifying security..." briefly

### Production Testing

1. **Deploy with reCAPTCHA enabled**
2. **Test form submissions**
3. **Monitor reCAPTCHA admin console** for:
   - Request volume
   - Score distribution
   - Potential issues

## 🚨 Troubleshooting

### Common Issues

**"reCAPTCHA not configured" message:**
- Check that `siteKey` is set correctly in `firebase-config.js`
- Ensure the site key is for the correct domain

**Forms not showing reCAPTCHA badge:**
- Check browser console for JavaScript errors
- Verify reCAPTCHA script is loading correctly

**High false positive rate:**
- Lower the `minimumScore` threshold
- Check if users are using VPNs or unusual browsers

**reCAPTCHA script fails to load:**
- Check network connectivity
- Verify domain is registered with reCAPTCHA
- Check for ad blockers or browser extensions

### Debug Mode

Enable debug logging by setting in browser console:
```javascript
localStorage.setItem('recaptcha-debug', 'true');
```

## 🔒 Security Best Practices

### Frontend Security

✅ **Do:**
- Use reCAPTCHA v3 (invisible, better UX)
- Validate forms before reCAPTCHA execution
- Provide user feedback during verification
- Handle reCAPTCHA failures gracefully

❌ **Don't:**
- Rely only on client-side verification
- Store secret keys in frontend code
- Skip backend validation in production

### Backend Security

✅ **Do:**
- Always verify tokens on your backend
- Check the action parameter
- Monitor and log suspicious activity
- Implement rate limiting

❌ **Don't:**
- Trust client-side verification alone
- Ignore score thresholds
- Log sensitive user data

## 📊 Monitoring

### reCAPTCHA Admin Console

Monitor your reCAPTCHA usage:
- **Traffic Analysis:** View request volume and patterns
- **Score Distribution:** See how human vs bot traffic is distributed
- **Error Reports:** Check for integration issues

### Application Monitoring

Track in your application:
- Form submission success rates
- reCAPTCHA failure rates
- User experience metrics
- False positive reports

## 🔄 Maintenance

### Regular Tasks

1. **Monthly:** Review reCAPTCHA analytics
2. **Quarterly:** Adjust score thresholds based on data
3. **As needed:** Update domains when deploying to new environments

### Updates

Keep the integration updated:
- Monitor Google reCAPTCHA announcements
- Update thresholds based on performance
- Review and update security practices

## 🆘 Support

### Resources

- **Google reCAPTCHA Docs:** [https://developers.google.com/recaptcha/docs/v3](https://developers.google.com/recaptcha/docs/v3)
- **Admin Console:** [https://www.google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
- **Community Support:** Stack Overflow with tag `google-recaptcha`

### Implementation Notes

This integration includes:
- ✅ reCAPTCHA v3 (invisible)
- ✅ Multi-form support (contact, career, support)
- ✅ Visual feedback and loading states
- ✅ Graceful fallback when disabled
- ✅ Configuration management
- ✅ Error handling and logging

The system is designed to work immediately with proper configuration and gracefully degrade when reCAPTCHA is not available or configured.
