// Environment variables are automatically available in Vercel serverless functions

const { db, auth } = require('../backend/config/firebase');
const pollinationsAI = require('../backend/utils/pollinationsAI');
const cloudinary = require('../backend/config/cloudinary');

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

  if (req.method !== 'POST') {
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

    const { prompt, type = 'text-to-image', imageUrl, settings = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Generate image using Pollinations AI
    let generatedImageUrl;
    
    if (type === 'text-to-image') {
      generatedImageUrl = await pollinationsAI.generateTextToImage(prompt, settings);
    } else if (type === 'image-to-image') {
      if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required for image-to-image generation' });
      }
      generatedImageUrl = await pollinationsAI.generateImageToImage(imageUrl, prompt, settings);
    } else {
      return res.status(400).json({ error: 'Invalid generation type' });
    }

    // Upload to Cloudinary for permanent storage
    const uploadResult = await cloudinary.uploader.upload(generatedImageUrl, {
      folder: 'styletransform',
      public_id: `${userId}_${Date.now()}`,
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    // Save to database
    const generation = {
      id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      prompt,
      imageUrl: uploadResult.secure_url,
      thumbnailUrl: uploadResult.secure_url.replace('/upload/', '/upload/w_300,h_300,c_fill/'),
      settings,
      status: 'completed',
      createdAt: new Date(),
      completedAt: new Date()
    };

    if (db) {
      await db.collection('generations').doc(generation.id).set(generation);
    }

    res.status(200).json({
      success: true,
      generation
    });

  } catch (error) {
    console.error('Generate API error:', error);
    res.status(500).json({ 
      error: 'Generation failed',
      message: error.message 
    });
  }
}