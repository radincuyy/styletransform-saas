// Debug endpoint untuk troubleshooting
// Environment variables are automatically available in Vercel serverless functions

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Check environment variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'Set ✅' : 'Missing ❌',
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'Set ✅' : 'Missing ❌',
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'Set ✅' : 'Missing ❌',
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'Set ✅' : 'Missing ❌',
      REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN ? 'Set ✅' : 'Missing ❌',
      POLLINATIONS_API_TOKEN: process.env.POLLINATIONS_API_TOKEN ? 'Set ✅' : 'Missing ❌',
    };

    // Test Firebase connection
    let firebaseStatus = 'Not tested';
    try {
      const { db, auth } = require('../backend/config/firebase');
      if (db && auth) {
        firebaseStatus = 'Connected ✅';
      } else {
        firebaseStatus = 'Not connected ❌';
      }
    } catch (error) {
      firebaseStatus = `Error: ${error.message}`;
    }

    // Test Cloudinary connection
    let cloudinaryStatus = 'Not tested';
    try {
      const cloudinary = require('../backend/config/cloudinary');
      if (cloudinary && cloudinary.config().cloud_name) {
        cloudinaryStatus = 'Connected ✅';
      } else {
        cloudinaryStatus = 'Not connected ❌';
      }
    } catch (error) {
      cloudinaryStatus = `Error: ${error.message}`;
    }

    res.status(200).json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      services: {
        firebase: firebaseStatus,
        cloudinary: cloudinaryStatus
      },
      vercel: {
        region: process.env.VERCEL_REGION || 'Unknown',
        url: process.env.VERCEL_URL || 'Unknown'
      }
    });

  } catch (error) {
    console.error('Debug API error:', error);
    res.status(500).json({ 
      error: 'Debug failed',
      message: error.message,
      stack: error.stack
    });
  }
}