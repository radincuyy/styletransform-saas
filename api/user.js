// Environment variables are automatically available in Vercel serverless functions

const { db, auth } = require('../backend/config/firebase');

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
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    if (req.method === 'GET') {
      // Get user profile and generations
      if (req.url.includes('/generations')) {
        // Get user generations
        if (!db) {
          console.log('⚠️ Database not available for generations query');
          return res.status(200).json({ generations: [] });
        }

        console.log('🔍 Querying generations for user:', userId);
        
        try {
          // Try with orderBy first, fallback without orderBy if it fails
          let generationsSnapshot;
          try {
            generationsSnapshot = await db
              .collection('generations')
              .where('userId', '==', userId)
              .orderBy('createdAt', 'desc')
              .limit(50)
              .get();
          } catch (orderError) {
            console.warn('⚠️ OrderBy failed, trying without orderBy:', orderError.message);
            // Fallback without orderBy (in case index doesn't exist)
            generationsSnapshot = await db
              .collection('generations')
              .where('userId', '==', userId)
              .limit(50)
              .get();
          }

          const generations = [];
          generationsSnapshot.forEach(doc => {
            const data = doc.data();
            console.log('📄 Found generation:', doc.id, data.prompt?.substring(0, 50));
            generations.push({ id: doc.id, ...data });
          });

          console.log(`✅ Found ${generations.length} generations for user`);
          
          // Sort in memory if we couldn't sort in query
          generations.sort((a, b) => {
            const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return bTime - aTime;
          });

          res.status(200).json({ generations });
        } catch (queryError) {
          console.error('❌ Error querying generations:', queryError);
          res.status(200).json({ generations: [] });
        }
      } else {
        // Get user profile
        if (!db) {
          return res.status(200).json({ 
            user: {
              uid: userId,
              email: decodedToken.email,
              displayName: decodedToken.name
            }
          });
        }

        const userDoc = await db.collection('users').doc(userId).get();
        let userData = {
          uid: userId,
          email: decodedToken.email,
          displayName: decodedToken.name
        };

        if (userDoc.exists) {
          userData = { ...userData, ...userDoc.data() };
        }

        res.status(200).json({ user: userData });
      }
    } else if (req.method === 'POST' || req.method === 'PUT') {
      // Update user profile
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };

      if (db) {
        await db.collection('users').doc(userId).set(updateData, { merge: true });
      }

      res.status(200).json({ 
        success: true,
        message: 'Profile updated successfully'
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('User API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}