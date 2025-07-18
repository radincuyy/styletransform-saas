// Dedicated endpoint for user generations

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
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    console.log('🔍 Getting generations for user:', userId);

    if (!db) {
      console.log('⚠️ Database not available');
      return res.status(200).json({ generations: [] });
    }

    try {
      // Get user generations without orderBy to avoid index issues
      const generationsSnapshot = await db
        .collection('generations')
        .where('userId', '==', userId)
        .limit(50)
        .get();

      const generations = [];
      generationsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log('📄 Found generation:', doc.id, data.prompt?.substring(0, 50));
        generations.push({ id: doc.id, ...data });
      });

      console.log(`✅ Found ${generations.length} generations for user`);
      
      // Sort in memory by timestamp/createdAt
      generations.sort((a, b) => {
        const aTime = a.timestamp?.toDate ? a.timestamp.toDate() : 
                     a.createdAt?.toDate ? a.createdAt.toDate() : 
                     new Date(a.timestamp || a.createdAt || 0);
        const bTime = b.timestamp?.toDate ? b.timestamp.toDate() : 
                     b.createdAt?.toDate ? b.createdAt.toDate() : 
                     new Date(b.timestamp || b.createdAt || 0);
        return bTime - aTime;
      });

      res.status(200).json({ generations });
    } catch (queryError) {
      console.error('❌ Error querying generations:', queryError);
      res.status(200).json({ generations: [] });
    }

  } catch (error) {
    console.error('Generations API error:', error);
    res.status(500).json({ 
      error: 'Failed to get generations',
      message: error.message
    });
  }
}