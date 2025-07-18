// Debug endpoint to check generations in database

const { db, auth } = require('../backend/config/firebase');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For debugging, let's be more flexible with auth
    const token = req.headers.authorization?.replace('Bearer ', '');
    let userId = 'debug-user';
    
    if (token) {
      try {
        const decodedToken = await auth.verifyIdToken(token);
        userId = decodedToken.uid;
        console.log('✅ Debug: Authenticated user:', userId);
      } catch (authError) {
        console.warn('⚠️ Debug: Auth failed, using debug mode:', authError.message);
        // Continue with debug mode
      }
    } else {
      console.log('⚠️ Debug: No token provided, using debug mode');
    }

    console.log('🔍 Debug: Checking generations for user:', userId);

    if (!db) {
      return res.status(200).json({ 
        error: 'Database not available',
        userId: userId,
        dbStatus: 'not connected'
      });
    }

    // Get all generations for this user (no limit, no orderBy)
    const generationsSnapshot = await db
      .collection('generations')
      .where('userId', '==', userId)
      .get();

    const generations = [];
    const debugInfo = {
      userId: userId,
      totalFound: generationsSnapshot.size,
      dbStatus: 'connected',
      generations: []
    };

    generationsSnapshot.forEach(doc => {
      const data = doc.data();
      generations.push({ id: doc.id, ...data });
      
      debugInfo.generations.push({
        id: doc.id,
        prompt: data.prompt?.substring(0, 100),
        type: data.type,
        createdAt: data.createdAt,
        timestamp: data.timestamp,
        generatedImageUrl: data.generatedImageUrl ? 'present' : 'missing',
        userId: data.userId
      });
    });

    console.log(`✅ Debug: Found ${generations.length} generations`);

    // Also check if there are ANY generations in the collection
    const allGenerationsSnapshot = await db
      .collection('generations')
      .limit(10)
      .get();

    debugInfo.totalInDatabase = allGenerationsSnapshot.size;
    debugInfo.sampleFromDatabase = [];
    
    allGenerationsSnapshot.forEach(doc => {
      const data = doc.data();
      debugInfo.sampleFromDatabase.push({
        id: doc.id,
        userId: data.userId,
        prompt: data.prompt?.substring(0, 50),
        createdAt: data.createdAt
      });
    });

    res.status(200).json(debugInfo);

  } catch (error) {
    console.error('Debug API error:', error);
    res.status(500).json({ 
      error: 'Debug failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}