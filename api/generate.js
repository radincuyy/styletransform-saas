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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('🚀 Generate API called');
  console.log('📝 Request body:', JSON.stringify(req.body, null, 2));

  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('🔐 Verifying token...');
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;
    console.log('✅ Token verified for user:', userId);

    const { prompt, type = 'text-to-image', imageUrl, settings = {} } = req.body;

    if (!prompt) {
      console.log('❌ No prompt provided');
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('🎨 Starting image generation...');
    console.log('📝 Prompt:', prompt);
    console.log('🔧 Type:', type);
    console.log('⚙️ Settings:', settings);

    // Simple image generation using Pollinations AI directly
    let generatedImageUrl;
    
    try {
      if (type === 'text-to-image') {
        console.log('🖼️ Generating text-to-image...');
        
        // Direct Pollinations AI call
        const width = settings.width || 512;
        const height = settings.height || 512;
        const seed = Math.floor(Math.random() * 1000000);
        
        const params = new URLSearchParams({
          width: width.toString(),
          height: height.toString(),
          model: 'flux',
          enhance: 'true',
          nologo: 'true',
          seed: seed.toString()
        });
        
        generatedImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`;
        console.log('🔗 Generated image URL:', generatedImageUrl);
        
      } else if (type === 'image-to-image') {
        if (!imageUrl) {
          console.log('❌ No image URL provided for image-to-image');
          return res.status(400).json({ error: 'Image URL is required for image-to-image generation' });
        }
        
        console.log('🔄 Generating image-to-image...');
        console.log('📷 Input image:', imageUrl);
        
        // For now, fallback to text-to-image with enhanced prompt
        const enhancedPrompt = `${prompt}, based on uploaded image, high quality, detailed`;
        const width = settings.width || 512;
        const height = settings.height || 512;
        const seed = Math.floor(Math.random() * 1000000);
        
        const params = new URLSearchParams({
          width: width.toString(),
          height: height.toString(),
          model: 'flux',
          enhance: 'true',
          nologo: 'true',
          seed: seed.toString()
        });
        
        generatedImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?${params}`;
        console.log('🔗 Generated image URL:', generatedImageUrl);
        
      } else {
        console.log('❌ Invalid generation type:', type);
        return res.status(400).json({ error: 'Invalid generation type' });
      }
    } catch (genError) {
      console.error('❌ Image generation failed:', genError);
      throw new Error(`Image generation failed: ${genError.message}`);
    }

    // Try to upload to Cloudinary (optional)
    let finalImageUrl = generatedImageUrl;
    let thumbnailUrl = generatedImageUrl;
    
    try {
      console.log('☁️ Attempting Cloudinary upload...');
      const cloudinary = require('../backend/config/cloudinary');
      
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const uploadResult = await cloudinary.uploader.upload(generatedImageUrl, {
          folder: 'styletransform',
          public_id: `${userId}_${Date.now()}`,
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        });
        
        finalImageUrl = uploadResult.secure_url;
        thumbnailUrl = uploadResult.secure_url.replace('/upload/', '/upload/w_300,h_300,c_fill/');
        console.log('✅ Cloudinary upload successful:', finalImageUrl);
      } else {
        console.log('⚠️ Cloudinary not configured, using direct URL');
      }
    } catch (uploadError) {
      console.warn('⚠️ Cloudinary upload failed, using direct URL:', uploadError.message);
      // Continue with direct URL
    }

    // Save to database (optional)
    const generation = {
      id: `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId,
      type,
      prompt,
      imageUrl: finalImageUrl,
      thumbnailUrl: thumbnailUrl,
      settings,
      status: 'completed',
      createdAt: new Date(),
      completedAt: new Date()
    };

    try {
      if (db) {
        console.log('💾 Saving to database...');
        await db.collection('generations').doc(generation.id).set(generation);
        console.log('✅ Database save successful');
      } else {
        console.log('⚠️ Database not available, skipping save');
      }
    } catch (dbError) {
      console.warn('⚠️ Database save failed:', dbError.message);
      // Continue without database save
    }

    console.log('🎉 Generation completed successfully!');
    res.status(200).json({
      success: true,
      generation
    });

  } catch (error) {
    console.error('❌ Generate API error:', error);
    res.status(500).json({ 
      error: 'Generation failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}