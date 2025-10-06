# Firebase Security Rules Fix

## Problem
You're seeing "Permission denied" errors when trying to load user submissions because Firebase Realtime Database security rules are blocking read access.

## Solution

Go to your Firebase Console and update the Realtime Database Rules:

### Step 1: Access Firebase Console
1. Go to https://console.firebase.google.com/
2. Select your project
3. Click on "Realtime Database" in the left sidebar
4. Click on the "Rules" tab

### Step 2: Update Rules

Replace your current rules with these:

```json
{
  "rules": {
    "contact-forms": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$submissionId": {
        ".read": "auth != null && (data.child('userId').val() === auth.uid || root.child('users').child(auth.uid).child('isAdmin').val() === true)",
        ".write": "auth != null && (data.child('userId').val() === auth.uid || !data.exists())"
      }
    },
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```

### What These Rules Do:

**For contact-forms:**
- ✅ Authenticated users can create new submissions
- ✅ Users can read their own submissions (where userId matches their auth.uid)
- ✅ Admins can read all submissions (if isAdmin flag is set)
- ✅ Users can update their own submissions

**For users:**
- ✅ Users can read their own profile data
- ✅ Users can write their own profile data
- ❌ Users cannot read other users' profiles

### Step 3: Publish Rules

1. Click "Publish" button in Firebase Console
2. Confirm the changes
3. Wait a few seconds for rules to propagate

### Step 4: Test

1. Refresh your website (https://rndmjunk.com)
2. Go to Contact page
3. Sign in
4. Click "Existing Projects"
5. The error should be gone!

---

## Alternative: More Permissive Rules (for testing only)

If you want to temporarily allow all authenticated users to read all submissions (useful for testing):

```json
{
  "rules": {
    "contact-forms": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```

⚠️ **Warning:** This allows any authenticated user to read ALL submissions. Only use for testing!

---

## For Your Admin Dashboard

When you build your admin dashboard on another site, you'll need to:

1. Add an `isAdmin` field to admin user profiles in Firebase
2. Use the first set of rules (which check for isAdmin)
3. Set `isAdmin: true` for your admin account

Example admin check:
```javascript
// In your admin user profile
{
  "name": "William",
  "email": "admin@rndmjunk.com",
  "isAdmin": true  // <-- Add this
}
```

---

Last Updated: October 6, 2025
