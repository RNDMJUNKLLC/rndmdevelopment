# 🔒 reCAPTCHA v3 Setup Guide

## What You'll See vs. What's Happening

### What You DON'T See:
- ❌ No "I'm not a robot" checkbox
- ❌ No image selection challenges
- ❌ No visible CAPTCHA elements

### What You DO See:
- ✅ Small security badges on forms: "🔒 This form is protected by reCAPTCHA"
- ✅ Button text changes: "Verifying security..." during submission
- ✅ Console logs showing reCAPTCHA activity
- ✅ Notification: "Verifying security to prevent spam..."

### What's Happening Behind the Scenes:
- 🔍 **Behavioral Analysis**: Tracking mouse movements, typing patterns, click timing
- 📊 **Risk Scoring**: Generating scores from 0.0 (bot) to 1.0 (human)
- 🛡️ **Automatic Protection**: Blocking suspicious submissions
- 📈 **Learning**: Improving accuracy over time

## Quick Setup (5 Minutes)

### Step 1: Get Your reCAPTCHA Keys
1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/create)
2. Click **"Create"** and choose:
   - **Type**: reCAPTCHA v3
   - **Domains**: Add `localhost` and your production domain
3. Copy your **Site Key**

### Step 2: Configure the Application
Edit `src/firebase-config.js`:

```javascript
export const recaptchaConfig = {
  siteKey: "6LcxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxA", // Your actual site key
  minimumScore: 0.5,  // Adjust 0.0 (strict) to 1.0 (lenient)
  enabled: true       // Set to false to disable
};
```

### Step 3: Test It
1. **Start development server**: `npm run dev`
2. **Open the demo**: Navigate to `recaptcha-demo.html`
3. **Watch the console**: See reCAPTCHA activity logs
4. **Submit a form**: Notice the "Verifying security..." state

## How to See It Working

### 1. Browser Console
Open Developer Tools (F12) and watch for:
```
reCAPTCHA initialized successfully!
Executing reCAPTCHA for action: contact_form
reCAPTCHA token generated successfully
```

### 2. Network Tab
Look for requests to:
- `https://www.google.com/recaptcha/api.js`
- `https://www.google.com/recaptcha/api2/...`

### 3. Visual Indicators
- Form badges showing security protection
- Button text changes during verification
- Success/error notifications

### 4. Demo Page
Open `recaptcha-demo.html` to see:
- Real-time status monitoring
- Simulated user scoring
- Activity logs
- Test form with protection

## Current Integration Status

### ✅ What's Implemented:
- reCAPTCHA v3 service (`src/recaptcha-service.js`)
- Integration with all forms (contact, career, support)
- Visual feedback and loading states
- Graceful fallbacks if reCAPTCHA fails
- Demo page for testing

### ⚠️ What Needs Setup:
- **Site Key**: Replace `YOUR_RECAPTCHA_SITE_KEY` with your actual key
- **Server Verification**: For production, implement server-side token verification

### 🔧 Forms Protected:
1. **Contact Forms** (`contact_form` action)
2. **Career Applications** (`career_application` action)
3. **Support Tickets** (`support_ticket` action)

## Testing Scenarios

### Normal User (Score 0.7-1.0):
- Forms submit normally
- No visible delays
- Success notifications

### Suspicious Activity (Score 0.3-0.6):
- May trigger additional verification
- Longer processing times
- Warning messages

### Bot Activity (Score 0.0-0.3):
- Form submission blocked
- "Security verification failed" error
- User prompted to try again

## Troubleshooting

### "reCAPTCHA not configured" Warning:
- Check that `siteKey` is set correctly
- Ensure domains are whitelisted in Google Console
- Verify reCAPTCHA type is v3

### No reCAPTCHA Activity:
- Check browser console for errors
- Ensure JavaScript is enabled
- Verify network connectivity

### Forms Still Submit Without Protection:
- This is intentional! Forms have graceful fallbacks
- Security verification happens but doesn't block legitimate users
- Check console logs to confirm reCAPTCHA is running

## Score Thresholds Guide

| Score Range | Interpretation | Action |
|-------------|----------------|---------|
| 0.9 - 1.0   | Very likely human | ✅ Allow immediately |
| 0.7 - 0.8   | Likely human | ✅ Allow with monitoring |
| 0.5 - 0.6   | Neutral | ⚠️ Additional verification |
| 0.3 - 0.4   | Likely bot | ❌ Block or challenge |
| 0.0 - 0.2   | Very likely bot | ❌ Block immediately |

**Current Threshold**: 0.5 (configurable in `recaptchaConfig.minimumScore`)

## Production Considerations

### Server-Side Verification:
```javascript
// Example backend verification (Node.js)
const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: `secret=${SECRET_KEY}&response=${token}&action=${action}`
});
const result = await response.json();
// Check result.success and result.score
```

### Security Best Practices:
- Never trust client-side verification alone
- Implement rate limiting
- Log and monitor suspicious activity
- Regular review of score thresholds

## Why You Don't See Traditional CAPTCHA

**reCAPTCHA v3 is designed to be invisible because:**
- Better user experience (no interruptions)
- More accurate bot detection
- Continuous protection (not just at submission)
- Machine learning improves over time
- Works on mobile devices seamlessly

The goal is security without friction! 🎯
