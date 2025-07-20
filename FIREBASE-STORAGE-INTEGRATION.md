# Firebase Storage Integration - Resume Upload System

This document outlines the Firebase Storage integration implemented for handling resume uploads in the career application system.

## Overview

The Firebase Storage integration enables:
- **Secure resume file uploads** during career application submission
- **File management** in the admin panel with download capabilities
- **Automatic file cleanup** when applications are deleted
- **Multiple file format support** (PDF, DOC, DOCX)

## Implementation Details

### 1. Firebase Service Updates (`src/firebase-service.js`)

#### New Storage Methods Added:

**`uploadResume(file, userEmail)`**
- Uploads resume files to Firebase Storage
- Creates unique filenames to prevent conflicts
- Returns download URL and storage path
- Handles upload errors gracefully

**`getResumeDownloadUrl(storagePath)`**
- Retrieves download URLs for stored files
- Used for downloading resumes in admin panel

**`deleteResume(storagePath)`**
- Removes files from Firebase Storage
- Called when applications are deleted

#### Updated Methods:

**`submitApplication(applicationData, resumeFile)`**
- Now accepts an optional resume file parameter
- Handles file upload before storing application data
- Stores file metadata (URL, path, name, size) with application

**`deleteApplication(applicationId)`**
- Enhanced to delete associated resume files
- Cleans up both database and storage data

### 2. Career Form Updates (`src/main.js`)

**Form Submission Process:**
1. Validates file type (PDF, DOC, DOCX) and size (max 5MB)
2. Uploads file to Firebase Storage
3. Stores application data with file metadata
4. Provides user feedback throughout the process

**File Validation:**
- File type validation using MIME types
- File size limit enforcement (5MB)
- Required field validation

### 3. Admin Panel Enhancements

**Resume Viewer Modal:**
- Displays file information and storage status
- Shows whether files use new Firebase Storage or legacy format
- Enhanced visual feedback with status indicators

**Download Functionality:**
- Direct download from Firebase Storage URLs
- Supports both new and legacy file formats
- Automatic file naming for downloads

**Visual Indicators:**
- Green checkmark for files stored in Firebase Storage
- Warning indicator for legacy formats
- File size and upload date display

### 4. Security Features

**File Naming Strategy:**
- Sanitized email addresses in filenames
- Timestamp-based unique identifiers
- Prevents filename conflicts and directory traversal

**Access Control:**
- Files stored in Firebase Storage with proper security rules
- Download URLs are temporary and secure
- Admin-only access to download functionality

**File Validation:**
- MIME type validation on upload
- File size restrictions
- Extension-based filtering

## File Storage Structure

```
Firebase Storage:
└── resumes/
    ├── resume_user_example_com_1234567890.pdf
    ├── resume_john_doe_example_com_1234567891.docx
    └── ...
```

**Filename Format:** `resume_{sanitized_email}_{timestamp}.{extension}`

## Usage Examples

### Career Application Submission

```javascript
// Form submission with file upload
const result = await firebaseService.submitApplication(applicationData, resumeFile);
```

### Admin Panel Resume Download

```javascript
// Download resume file
function downloadResumeFile(appId) {
  const app = careerApplications.find(a => a.id === appId);
  // Uses resumeUrl for direct download or resumeStoragePath for legacy files
}
```

### File Upload Validation

```javascript
// File validation before upload
if (resumeFile.size > 5 * 1024 * 1024) {
  showNotification('Resume file size must be less than 5MB', 'error');
  return;
}

const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
if (!allowedTypes.includes(resumeFile.type)) {
  showNotification('Please upload a PDF, DOC, or DOCX file', 'error');
  return;
}
```

## Database Schema Updates

### Application Records

New fields added to career applications:

```javascript
{
  // Existing fields...
  resumeFileName: "resume.pdf",           // Original filename
  resumeSize: 1024567,                    // File size in bytes
  resumeUrl: "https://firebase...",       // Direct download URL
  resumeStoragePath: "resumes/resume_..."  // Storage path for file operations
}
```

## Error Handling

**Upload Failures:**
- Network issues during upload
- Firebase Storage quota limits
- Invalid file formats

**Download Failures:**
- Missing or deleted files
- Expired download URLs
- Network connectivity issues

**Graceful Degradation:**
- Continues with application submission if email fails
- Shows appropriate error messages to users
- Logs detailed error information for debugging

## Testing

### Test Upload Page

A test upload page (`test-upload.html`) is provided for:
- Testing file upload functionality
- Validating Firebase Storage integration
- Checking download URL generation

### Manual Testing Steps

1. **Submit Career Application:**
   - Fill out career form
   - Upload resume file
   - Verify successful submission

2. **Admin Panel Testing:**
   - View application in admin panel
   - Check resume viewer modal
   - Test file download functionality

3. **Error Testing:**
   - Try uploading oversized files
   - Test invalid file formats
   - Verify error messages

## Future Enhancements

**Possible Improvements:**
- File preview capabilities (PDF viewer)
- Resume parsing and keyword extraction
- Automatic virus scanning
- Multiple file uploads per application
- File versioning for updated resumes

## Security Considerations

**Current Security Measures:**
- Firebase Security Rules for storage access
- File type and size validation
- Sanitized file naming
- Admin-only download access

**Additional Security Recommendations:**
- Implement virus scanning for uploaded files
- Add rate limiting for uploads
- Monitor storage usage and costs
- Regular security audits of file access patterns

## Configuration

### Firebase Storage Rules

Ensure your Firebase Storage security rules allow the application to upload and download resume files:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /resumes/{fileName} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Environment Variables

No additional environment variables are required - the integration uses the existing Firebase configuration.

## Troubleshooting

### Common Issues

**Upload Fails:**
- Check Firebase Storage configuration
- Verify internet connectivity
- Confirm file size and type requirements

**Download Issues:**
- Ensure file exists in Firebase Storage
- Check Firebase Storage security rules
- Verify download URL generation

**Admin Panel Issues:**
- Confirm user has admin permissions
- Check console for JavaScript errors
- Verify Firebase database connectivity

### Debug Information

The system logs detailed information to the browser console:
- Upload progress and results
- Download URL generation
- Error details and stack traces
- File metadata and validation results

## reCAPTCHA v3 Integration

### Overview
The application includes Google reCAPTCHA v3 for invisible spam protection on all forms:
- **Contact forms** - Protects project inquiries
- **Career applications** - Prevents spam applications
- **Support tickets** - Secures help requests

### How It Works
- **Invisible protection** - No user interaction required
- **Behavioral analysis** - Analyzes mouse movements, typing patterns
- **Risk scoring** - Provides scores from 0.0 (bot) to 1.0 (human)
- **Automatic blocking** - Low scores trigger security measures

### Setup Instructions

1. **Get reCAPTCHA Keys:**
   - Visit [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin/create)
   - Create a new site with reCAPTCHA v3
   - Add your domain (use `localhost` for development)

2. **Configure the Application:**
   ```javascript
   // In src/firebase-config.js
   export const recaptchaConfig = {
     siteKey: "YOUR_ACTUAL_SITE_KEY", // Replace with your site key
     minimumScore: 0.5,               // Adjust threshold (0.0-1.0)
     enabled: true                    // Enable/disable protection
   };
   ```

3. **Test the Integration:**
   - Open `recaptcha-demo.html` to see how it works
   - Check browser console for reCAPTCHA activity
   - Forms will show "🔒 Verifying security..." during submission

### Visual Indicators
- Forms show security badges: "🔒 This form is protected by reCAPTCHA"
- Submission buttons change to "Verifying security..." during checks
- Success/failure notifications inform users of security status

### Technical Details
- **Client-side**: Token generation and basic validation
- **Server-side**: Full verification should be implemented for production
- **Fallback**: Forms work even if reCAPTCHA fails to load
- **Privacy**: Complies with reCAPTCHA privacy requirements
