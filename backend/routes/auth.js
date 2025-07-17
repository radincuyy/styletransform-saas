const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { db } = require('../config/firebase');
const analytics = require('../utils/analytics');

const router = express.Router();

// POST /api/auth/verify - Verify token and get user info
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { uid, email, name } = req.user;

    // Check if database is available
    if (!db) {
      console.warn('Database not available, returning mock user data');
      return res.json({
        success: true,
        user: {
          uid,
          email,
          name: name || email?.split('@')[0] || 'User',
          createdAt: new Date(),
          generationsUsed: 0,
          isPremium: false,
          subscriptionStatus: 'free'
        },
        isNewUser: false
      });
    }

    // Get or create user document
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create new user document
      const userData = {
        uid,
        email,
        name: name || email?.split('@')[0] || 'User',
        createdAt: new Date(),
        generationsUsed: 0,
        isPremium: false,
        subscriptionStatus: 'free'
      };
      await userRef.set(userData);
      
      // Track new user registration
      analytics.trackUserRegistration(uid, 'firebase');
      
      res.json({
        success: true,
        user: userData,
        isNewUser: true
      });
    } else {
      const userData = userDoc.data();
      
      // Track user login
      analytics.trackUserLogin(uid, 'firebase');
      
      res.json({
        success: true,
        user: userData,
        isNewUser: false
      });
    }
  } catch (error) {
    console.error('Auth verify error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to verify user',
      message: error.message 
    });
  }
});

// GET /api/auth/profile - Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { uid, email, name } = req.user;
    
    // Check if database is available
    if (!db) {
      console.warn('Database not available, returning mock profile data');
      return res.json({
        user: {
          uid,
          email,
          name: name || email?.split('@')[0] || 'User',
          createdAt: new Date(),
          generationsUsed: 0,
          isPremium: false,
          subscriptionStatus: 'free'
        }
      });
    }
    
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    res.json({ user: userData });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { name, preferences } = req.body;

    // Check if database is available
    if (!db) {
      console.warn('Database not available, profile update skipped');
      return res.json({ 
        success: true, 
        message: 'Profile updated successfully (mock response)' 
      });
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (name) updateData.name = name;
    if (preferences) updateData.preferences = preferences;

    await db.collection('users').doc(uid).update(updateData);

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;