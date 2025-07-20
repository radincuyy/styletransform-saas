// Environment variables are automatically available in Vercel serverless functions

const { db, auth } = require('./_config/firebase');

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
        
        console.log('🔄 Generating image-to-image with Kontext model...');
        console.log('📷 Input image:', imageUrl.substring(0, 100) + '...');
        
        let inputImageUrl = imageUrl;
        
        // Upload to Cloudinary for clean URL (with fallback)
        try {
          console.log('☁️ Uploading input image to Cloudinary...');
          const cloudinary = require('./_config/cloudinary');
          
          if (process.env.CLOUDINARY_CLOUD_NAME) {
            const uploadResult = await cloudinary.uploader.upload(imageUrl, {
              folder: 'styletransform/inputs',
              public_id: `input_${userId}_${Date.now()}`,
              transformation: [
                { quality: 'auto' },
                { fetch_format: 'auto' },
                { width: 1024, height: 1024, crop: 'limit' }
              ]
            });
            
            inputImageUrl = uploadResult.secure_url;
            console.log('✅ Input image uploaded to Cloudinary:', inputImageUrl);
          } else {
            console.warn('⚠️ Cloudinary not configured, using original image URL');
          }
        } catch (uploadError) {
          console.warn('⚠️ Input image upload failed, using original URL:', uploadError.message);
          // Continue with original imageUrl instead of failing
        }
        
        // Generate with Kontext model (with robust error handling)
        try {
          const width = Math.min(settings.width || 512, 1024);
          const height = Math.min(settings.height || 512, 1024);
          const seed = Math.floor(Math.random() * 1000000);
          
          console.log('🔧 Kontext parameters:', { width, height, seed });
          
          // Use your specific token for Kontext model
          const token = 'Zs0rHdIr--0WN1-J';
          
          // Build optimized prompt (keep it short for URL length)
          const optimizedPrompt = prompt.length > 30 ? prompt.substring(0, 30) : prompt;
          
          // Build Kontext URL with essential parameters only
          const params = new URLSearchParams({
            model: 'kontext',
            token: token,
            image: inputImageUrl,
            seed: seed.toString()
          });
          
          generatedImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(optimizedPrompt)}?${params}`;
          console.log('🔗 Generated Kontext image URL:', generatedImageUrl);
          console.log('📏 URL length:', generatedImageUrl.length);
          
          // Test URL validity by making a quick HEAD request
          try {
            console.log('🔍 Testing Kontext URL validity...');
            const testResponse = await fetch(generatedImageUrl, { method: 'HEAD', timeout: 5000 });
            console.log('📊 URL test response status:', testResponse.status);
            
            if (!testResponse.ok) {
              console.warn('⚠️ Kontext URL returned non-OK status:', testResponse.status);
            } else {
              console.log('✅ Kontext URL is valid and accessible');
            }
          } catch (testError) {
            console.warn('⚠️ URL test failed (but continuing):', testError.message);
          }
          
        } catch (kontextError) {
          console.warn('⚠️ Kontext URL generation failed:', kontextError.message);
          // Don't fail here, continue with the process
        }
        
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
      const cloudinary = require('./_config/cloudinary');
      
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

    // Save to database and update user stats
    const generation = {
      id: `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId,
      type,
      prompt,
      generatedImageUrl: finalImageUrl, // Match frontend expectation
      thumbnailUrl: thumbnailUrl,
      stylePreset: settings.stylePreset || null,
      settings,
      status: 'completed',
      timestamp: new Date(), // Match frontend expectation
      createdAt: new Date(),
      completedAt: new Date()
    };

    try {
      if (db) {
        console.log('💾 Saving to database...');
        
        // Save generation
        await db.collection('generations').doc(generation.id).set(generation);
        console.log('✅ Generation saved to database');
        
        // Update user stats
        console.log('📊 Updating user stats...');
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        let currentStats = {
          generationsUsed: 0,
          generationLimit: 5,
          totalGenerations: 0,
          isPremium: false
        };
        
        if (userDoc.exists) {
          currentStats = { ...currentStats, ...userDoc.data() };
        }
        
        // Increment counters
        const updatedStats = {
          ...currentStats,
          generationsUsed: (currentStats.generationsUsed || 0) + 1,
          totalGenerations: (currentStats.totalGenerations || 0) + 1,
          lastGenerationAt: new Date(),
          updatedAt: new Date()
        };
        
        await userRef.set(updatedStats, { merge: true });
        console.log('✅ User stats updated:', updatedStats);
        
      } else {
        console.log('⚠️ Database not available, skipping save');
      }
    } catch (dbError) {
      console.warn('⚠️ Database save failed:', dbError.message);
      // Continue without database save
    }

    // Validate that we have a valid image URL before responding
    if (!finalImageUrl || finalImageUrl === 'undefined') {
      console.error('❌ No valid image URL generated');
      return res.status(500).json({ 
        error: 'Image generation failed - no valid URL produced',
        message: 'The AI service did not return a valid image URL'
      });
    }

    console.log('🎉 Generation completed successfully!');
    console.log('📤 Final response:', {
      success: true,
      generationId: generation.id,
      imageUrl: finalImageUrl,
      type: type
    });
    
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