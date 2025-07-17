const { auth } = require('../config/firebase');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // If Firebase auth is not available (development mode), create mock user
    if (!auth) {
      console.warn('⚠️  Running in development mode - using mock authentication');
      req.user = {
        uid: 'dev-user-123',
        email: 'dev@example.com',
        name: 'Development User'
      };
      return next();
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    
    // In development mode, allow requests to pass through
    if (process.env.NODE_ENV === 'development' && !auth) {
      console.warn('⚠️  Auth failed but allowing in development mode');
      req.user = {
        uid: 'dev-user-123',
        email: 'dev@example.com',
        name: 'Development User'
      };
      return next();
    }
    
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authenticateToken };