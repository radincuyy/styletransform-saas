// Environment variables are automatically available in Vercel serverless functions

const { auth } = require('../backend/config/firebase');

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
    // Handle auth routes
    if (req.url.includes('/verify-token')) {
      // Verify Firebase token
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decodedToken = await auth.verifyIdToken(token);
      res.status(200).json({ 
        success: true, 
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name
        }
      });
    } else {
      res.status(404).json({ error: 'Route not found' });
    }
  } catch (error) {
    console.error('Auth API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}