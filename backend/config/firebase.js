const admin = require('firebase-admin');

let db, auth, storage;

try {
  console.log('🔥 Initializing Firebase Admin...');
  console.log('📋 Environment check:');
  console.log('- PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'Set ✅' : 'Missing ❌');
  console.log('- CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'Set ✅' : 'Missing ❌');
  console.log('- PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'Set ✅' : 'Missing ❌');

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    // Clean and format private key with multiple approaches
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    console.log('🔑 Original private key length:', privateKey ? privateKey.length : 0);
    console.log('🔑 Private key starts with:', privateKey ? privateKey.substring(0, 50) + '...' : 'undefined');
    
    // Handle different private key formats
    if (privateKey) {
      // Replace literal \n with actual newlines
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
        console.log('🔧 Replaced \\n with newlines');
      }
      
      // Ensure proper header/footer
      if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        console.warn('⚠️ Private key missing BEGIN header');
      }
      if (!privateKey.includes('-----END PRIVATE KEY-----')) {
        console.warn('⚠️ Private key missing END footer');
      }
      
      console.log('🔑 Processed private key length:', privateKey.length);
      console.log('🔑 Has proper format:', privateKey.includes('-----BEGIN PRIVATE KEY-----') && privateKey.includes('-----END PRIVATE KEY-----'));
    } else {
      console.error('❌ Private key is undefined or empty');
    }

    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: privateKey,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
    };

    console.log('🔑 Service account object created');

    // Initialize Firebase Admin only if not already initialized
    if (!admin.apps.length) {
      console.log('🚀 Initializing Firebase Admin SDK...');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'stylist-727b5.firebasestorage.app'
      });
      console.log('✅ Firebase Admin SDK initialized');
    } else {
      console.log('✅ Firebase Admin SDK already initialized');
    }

    // Initialize services
    db = admin.firestore();
    auth = admin.auth();
    storage = admin.storage();
    
    console.log('✅ Firebase services initialized successfully');
    
    // Test connection (without await since this is not an async function)
    db.collection('test').limit(1).get()
      .then(() => console.log('✅ Firestore connection test successful'))
      .catch(testError => console.warn('⚠️ Firestore connection test failed:', testError.message));
    
  } else {
    throw new Error('Missing required Firebase environment variables');
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
  console.error('📋 Error details:', error);
  
  // Set to null for graceful degradation
  db = null;
  auth = null;
  storage = null;
}

module.exports = { admin, db, auth, storage };