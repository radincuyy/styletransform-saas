// Load environment variables first for serverless functions
require('dotenv').config();
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let db, auth, storage;

try {
  // Try to use service account file first
  const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require('./firebase-service-account.json');
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'stylist-727b5.firebasestorage.app'
      });
    }

    db = admin.firestore();
    auth = admin.auth();
    storage = admin.storage();
    
    console.log('✅ Firebase Admin initialized successfully with service account file');
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    // Fallback to environment variables
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
    };

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }

    db = admin.firestore();
    auth = admin.auth();
    storage = admin.storage();
    
    console.log('✅ Firebase Admin initialized successfully with environment variables');
  } else {
    throw new Error('No Firebase credentials found');
  }
} catch (error) {
  console.warn('⚠️  Firebase Admin initialization failed:', error.message);
  console.warn('⚠️  Running in development mode without Firebase');
  
  // Set to null for development mode
  db = null;
  auth = null;
  storage = null;
}

module.exports = { admin, db, auth, storage };