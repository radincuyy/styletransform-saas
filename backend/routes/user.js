const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { db } = require('../config/firebase');

const router = express.Router();

// GET /api/user/stats - Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.user;

    // Check if database is available
    if (!db) {
      console.warn('Database not available, returning default stats');
      return res.json({ 
        stats: {
          totalGenerations: 0,
          generationsUsed: 0,
          generationLimit: 5,
          isPremium: false,
          subscriptionStatus: 'free',
          memberSince: new Date()
        }
      });
    }

    // Get user data
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data() || {};

    // Get generation count with error handling
    let totalGenerations = 0;
    try {
      const generationsSnapshot = await db.collection('generations')
        .where('userId', '==', uid)
        .get();
      totalGenerations = generationsSnapshot.size;
    } catch (error) {
      console.warn('⚠️  Failed to fetch generation count (index may be building):', error.message);
      // Use generationsUsed as fallback
      totalGenerations = userData.generationsUsed || 0;
    }

    const stats = {
      totalGenerations,
      generationsUsed: userData.generationsUsed || 0,
      generationLimit: userData.isPremium ? 100 : 5,
      isPremium: userData.isPremium || false,
      subscriptionStatus: userData.subscriptionStatus || 'free',
      memberSince: userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date()
    };

    res.json({ stats });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user stats',
      stats: {
        totalGenerations: 0,
        generationsUsed: 0,
        generationLimit: 5,
        isPremium: false,
        subscriptionStatus: 'free',
        memberSince: new Date()
      }
    });
  }
});

// GET /api/user/usage - Get detailed usage information
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.user;

    // Check if database is available
    if (!db) {
      console.warn('Database not available, returning default usage');
      return res.json({ 
        usage: {
          generationsUsed: 0,
          generationLimit: 5,
          generationsRemaining: 5,
          usageByDay: {},
          recentGenerations: []
        }
      });
    }

    // Get user data
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data() || {};

    let recentGenerations = [];
    let usageByDay = {};

    try {
      // Get recent generations with fallback query
      let recentGenerationsSnapshot;
      try {
        // Try complex query first
        recentGenerationsSnapshot = await db.collection('generations')
          .where('userId', '==', uid)
          .orderBy('timestamp', 'desc')
          .limit(30)
          .get();
      } catch (indexError) {
        console.warn('⚠️  Complex usage query failed, using simple query:', indexError.message);
        // Fallback to simple query
        recentGenerationsSnapshot = await db.collection('generations')
          .where('userId', '==', uid)
          .limit(30)
          .get();
      }

      recentGenerationsSnapshot.forEach(doc => {
        const data = doc.data();
        recentGenerations.push({
          id: doc.id,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
          status: data.status || 'completed'
        });
      });

      // Sort manually if we couldn't use orderBy
      recentGenerations.sort((a, b) => b.timestamp - a.timestamp);

      // Calculate usage by day for the last 30 days
      recentGenerations.forEach(gen => {
        const dateKey = gen.timestamp.toISOString().split('T')[0];
        usageByDay[dateKey] = (usageByDay[dateKey] || 0) + 1;
      });
    } catch (error) {
      console.warn('⚠️  Failed to fetch usage data (index may be building):', error.message);
    }

    const generationLimit = userData.isPremium ? 100 : 5;
    const generationsUsed = userData.generationsUsed || 0;

    const usage = {
      generationsUsed,
      generationLimit,
      generationsRemaining: Math.max(0, generationLimit - generationsUsed),
      usageByDay,
      recentGenerations: recentGenerations.slice(0, 10)
    };

    res.json({ usage });
  } catch (error) {
    console.error('Usage fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch usage data',
      usage: {
        generationsUsed: 0,
        generationLimit: 5,
        generationsRemaining: 5,
        usageByDay: {},
        recentGenerations: []
      }
    });
  }
});

module.exports = router;