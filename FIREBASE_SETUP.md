# 🔥 Firebase Setup Guide - StyleTransform SaaS

## 🔒 **SECURITY NOTICE**
The `firebase-service-account.json` file has been removed from the repository for security reasons. You need to create this file manually for local development and use environment variables for production.

---

## 📋 **Local Development Setup**

### **STEP 1: Get Firebase Service Account**

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `stylist-727b5`
3. **Go to Project Settings** (gear icon)
4. **Service Accounts tab**
5. **Click "Generate new private key"**
6. **Download the JSON file**

### **STEP 2: Setup Local Firebase Config**

1. **Rename downloaded file** to `firebase-service-account.json`
2. **Move to**: `backend/config/firebase-service-account.json`
3. **Verify .gitignore** includes this file (already configured)

```bash
# The file should be in this location:
backend/config/firebase-service-account.json

# And should NOT be committed to Git (ignored by .gitignore)
```

### **STEP 3: Verify Firebase Configuration**

Your `firebase-service-account.json` should look like this:

```json
{
  "type": "service_account",
  "project_id": "stylist-727b5",
  "private_key_id": "your-actual-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@stylist-727b5.iam.gserviceaccount.com",
  "client_id": "your-actual-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40stylist-727b5.iam.gserviceaccount.com"
}
```

---

## 🚀 **Production Deployment Setup**

For production, use **environment variables** instead of the JSON file:

### **Environment Variables for Production:**

```env
FIREBASE_PROJECT_ID=stylist-727b5
FIREBASE_PRIVATE_KEY_ID=your-actual-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@stylist-727b5.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-actual-client-id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40stylist-727b5.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=stylist-727b5.firebasestorage.app
```

### **Platform-Specific Setup:**

#### **Vercel:**
1. Go to your project dashboard
2. Settings → Environment Variables
3. Add each Firebase variable individually
4. For `FIREBASE_PRIVATE_KEY`, wrap in quotes and include `\n` for line breaks

#### **Railway:**
1. Go to your project dashboard
2. Variables tab
3. Add each Firebase environment variable
4. Railway handles multiline variables automatically

#### **Heroku:**
1. Go to your app dashboard
2. Settings → Config Vars
3. Add each Firebase variable
4. For `FIREBASE_PRIVATE_KEY`, use the raw key with actual line breaks

---

## 🔧 **Backend Configuration**

The backend is already configured to use environment variables when available, falling back to the JSON file for local development:

```javascript
// backend/config/firebase.js
const admin = require('firebase-admin');

let serviceAccount;

if (process.env.FIREBASE_PRIVATE_KEY) {
  // Production: Use environment variables
  serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
  };
} else {
  // Local development: Use JSON file
  try {
    serviceAccount = require('./firebase-service-account.json');
  } catch (error) {
    console.error('Firebase service account file not found. Please follow FIREBASE_SETUP.md');
  }
}
```

---

## ✅ **Verification Steps**

### **Local Development:**
```bash
# Test Firebase connection
cd backend
npm start

# Should see in console:
# ✅ Firebase Admin initialized successfully
# 📊 Database Status: Connected ✅
```

### **Production:**
```bash
# Check deployment logs for:
# ✅ Firebase Admin initialized successfully
# 📊 Database Status: Connected ✅
```

---

## 🛡️ **Security Best Practices**

### **✅ DO:**
- Use environment variables in production
- Keep `firebase-service-account.json` in `.gitignore`
- Rotate service account keys regularly
- Use least privilege principle for Firebase rules

### **❌ DON'T:**
- Commit service account JSON to Git
- Share service account keys in chat/email
- Use production keys in development
- Hardcode credentials in source code

---

## 🆘 **Troubleshooting**

### **Error: "Firebase service account file not found"**
**Solution**: Create `backend/config/firebase-service-account.json` following Step 2 above.

### **Error: "Firebase Admin SDK initialization failed"**
**Solution**: Verify your service account has the correct permissions:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Ensure the service account has "Firebase Admin SDK" role
3. Regenerate the key if needed

### **Error: "Permission denied" in Firestore**
**Solution**: Check your Firestore security rules:
```javascript
// Allow authenticated users to read/write their own data
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /generations/{generationId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 📞 **Support**

If you encounter issues with Firebase setup:

1. **Check the logs** in your deployment platform
2. **Verify environment variables** are set correctly
3. **Test locally first** before deploying to production
4. **Check Firebase Console** for any service account issues

**🔥 Your Firebase setup is now secure and production-ready!** ✨