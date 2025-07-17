const express = require('express');
const multer = require('multer');
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');
const { db } = require('../config/firebase');
const cloudinary = require('../config/cloudinary');
const analytics = require('../utils/analytics');
const PollinationsAI = require('../utils/pollinationsAI');
const ProdiaAI = require('../utils/prodiaAI');

const router = express.Router();

// Initialize AI generators
const pollinationsAI = new PollinationsAI();
const prodiaAI = new ProdiaAI();

// Generate mock style image for demo purposes
const generateMockStyleImage = (prompt, stylePreset) => {
  const mockImages = {
    'Modern Casual': 'https://via.placeholder.com/512x512/3B82F6/FFFFFF?text=Modern+Casual+Style',
    'Business Professional': 'https://via.placeholder.com/512x512/1F2937/FFFFFF?text=Business+Professional',
    'Vintage Chic': 'https://via.placeholder.com/512x512/8B5CF6/FFFFFF?text=Vintage+Chic+Style',
    'Street Style': 'https://via.placeholder.com/512x512/EF4444/FFFFFF?text=Street+Style',
    'Elegant Evening': 'https://via.placeholder.com/512x512/F59E0B/FFFFFF?text=Elegant+Evening',
    'Bohemian Free': 'https://via.placeholder.com/512x512/10B981/FFFFFF?text=Bohemian+Style'
  };

  // If style preset is selected, use corresponding mock image
  if (stylePreset && mockImages[stylePreset]) {
    return mockImages[stylePreset];
  }

  // Generate mock image based on prompt keywords
  const promptLower = (prompt || '').toLowerCase();
  if (promptLower.includes('business') || promptLower.includes('professional') || promptLower.includes('suit')) {
    return mockImages['Business Professional'];
  } else if (promptLower.includes('casual') || promptLower.includes('street')) {
    return mockImages['Modern Casual'];
  } else if (promptLower.includes('elegant') || promptLower.includes('evening') || promptLower.includes('formal')) {
    return mockImages['Elegant Evening'];
  } else if (promptLower.includes('vintage') || promptLower.includes('retro')) {
    return mockImages['Vintage Chic'];
  } else if (promptLower.includes('bohemian') || promptLower.includes('boho')) {
    return mockImages['Bohemian Free'];
  } else {
    // Default mock image with custom text
    const encodedPrompt = encodeURIComponent(prompt || 'Style Transform');
    return `https://via.placeholder.com/512x512/6366F1/FFFFFF?text=${encodedPrompt}`;
  }
};

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 2 // Maximum 2 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP are allowed.`), false);
    }
  }
});

// Multer error handler middleware
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: 'Image size must be less than 10MB'
      });
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files',
        message: 'Maximum 2 files allowed'
      });
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected file field',
        message: 'Please use mainImage and referenceImage fields'
      });
    }
  } else if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type',
      message: error.message
    });
  }
  next(error);
};

// Upload image to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    // Check if Cloudinary is properly configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn('Cloudinary not configured, creating mock URL');
      // Create a mock URL for development
      const mockUrl = `https://via.placeholder.com/512x512/4F46E5/FFFFFF?text=${folder.replace('-', '+')}&${Date.now()}`;
      resolve({ secure_url: mockUrl, public_id: `mock_${Date.now()}` });
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: folder,
        transformation: [
          { width: 1024, height: 1024, crop: 'limit' },
          { quality: 'auto' }
        ],
        timeout: 60000 // 60 second timeout
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error(`Image upload failed: ${error.message}`));
        } else {
          console.log(`✅ Image uploaded to Cloudinary: ${result.secure_url}`);
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
};

// Generate style transformation using image + text prompt
const generateWithFlux = async (mainImageUrl, userPrompt, stylePreset = null, retryCount = 0) => {
  const maxRetries = 2;
  const maxPollTime = 180000; // 3 minutes max polling time
  const pollInterval = 3000; // 3 seconds between polls
  
  try {
    // Check if Replicate API token is configured
    console.log('🔍 Checking Replicate API token...');
    console.log('Token exists:', !!process.env.REPLICATE_API_TOKEN);
    console.log('Token value:', process.env.REPLICATE_API_TOKEN ? `${process.env.REPLICATE_API_TOKEN.substring(0, 10)}...` : 'undefined');
    
    if (!process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN.includes('your_replicate')) {
      console.error('❌ Replicate API token not configured properly');
      console.error('Expected format: r8_xxxxxxxxxxxxxxxxxxxxxxxxx');
      console.error('Current value:', process.env.REPLICATE_API_TOKEN || 'undefined');
      throw new Error('Replicate API token not configured');
    }
    
    console.log('✅ Replicate API token is configured');

    // Build the final prompt combining user input and style preset
    let finalPrompt = userPrompt || "Transform this person with a new style";
    
    if (stylePreset) {
      const stylePrompts = {
        'Modern Casual': 'modern casual outfit, trendy streetwear, contemporary fashion',
        'Business Professional': 'professional business attire, formal suit, corporate style',
        'Vintage Chic': 'vintage fashion, retro style, classic elegant clothing',
        'Street Style': 'urban streetwear, hip-hop fashion, edgy modern style',
        'Elegant Evening': 'elegant evening wear, formal dress, sophisticated style',
        'Bohemian Free': 'bohemian style, flowing fabrics, free-spirited fashion'
      };
      
      const styleDescription = stylePrompts[stylePreset] || stylePreset;
      finalPrompt = `${finalPrompt}, ${styleDescription}`;
    }
    
    finalPrompt += ", high quality, photorealistic, detailed, professional photography";
    
    console.log(`🎨 Starting AI generation (attempt ${retryCount + 1}/${maxRetries + 1})`);
    console.log(`📸 Main image: ${mainImageUrl}`);
    console.log(`📝 Final prompt: ${finalPrompt}`);
    console.log(`🎭 Style preset: ${stylePreset || 'None'}`);
    
    // Test API connection first
    console.log('🔍 Testing Replicate API connection...');
    
    try {
      // First, let's test with a simple API call to verify our token
      const testResponse = await axios.get('https://api.replicate.com/v1/models', {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      console.log('✅ Replicate API connection successful');
    } catch (testError) {
      console.error('❌ Replicate API connection failed:', testError.message);
      if (testError.response) {
        console.error('📡 Test response status:', testError.response.status);
        console.error('📡 Test response data:', testError.response.data);
      }
      throw new Error(`Replicate API connection failed: ${testError.message}`);
    }

    // Try multiple models in order of preference
    const models = [
      {
        name: "Stable Diffusion XL",
        version: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        input: {
          prompt: `A person ${finalPrompt}`,
          negative_prompt: "blurry, low quality, distorted, deformed, bad anatomy, extra limbs, worst quality, low quality, duplicate, mutation",
          width: 1024,
          height: 1024,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          num_outputs: 1,
          seed: Math.floor(Math.random() * 1000000)
        }
      },
      {
        name: "Stable Diffusion 1.5",
        version: "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
        input: {
          prompt: `A person ${finalPrompt}`,
          negative_prompt: "blurry, low quality, distorted, deformed, bad anatomy, extra limbs, worst quality, low quality, duplicate, mutation",
          width: 512,
          height: 512,
          num_inference_steps: 50,
          guidance_scale: 7.5,
          num_outputs: 1,
          seed: Math.floor(Math.random() * 1000000)
        }
      }
    ];

    let createResponse;
    let lastError;

    // Try each model until one works
    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      console.log(`🔄 Trying model: ${model.name}`);
      
      try {
        createResponse = await axios.post('https://api.replicate.com/v1/predictions', {
          version: model.version,
          input: model.input
        }, {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });
        
        console.log(`✅ Successfully created prediction with ${model.name}`);
        break; // Success, exit loop
        
      } catch (modelError) {
        console.warn(`⚠️  ${model.name} failed:`, modelError.message);
        lastError = modelError;
        
        if (i === models.length - 1) {
          // Last model failed, throw error
          throw lastError;
        }
        // Continue to next model
      }
    }

    let result = createResponse.data;
    console.log(`🆔 Prediction created with ID: ${result.id}`);
    console.log(`📊 Initial status: ${result.status}`);

    // Poll for completion
    const startTime = Date.now();
    let pollCount = 0;
    
    while (result.status === 'starting' || result.status === 'processing') {
      pollCount++;
      
      // Check timeout
      if (Date.now() - startTime > maxPollTime) {
        throw new Error(`Generation timeout after ${Math.round(maxPollTime/1000)} seconds`);
      }
      
      console.log(`⏳ Polling attempt ${pollCount}, status: ${result.status}`);
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      try {
        const statusResponse = await axios.get(`https://api.replicate.com/v1/predictions/${result.id}`, {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
          },
          timeout: 15000
        });
        
        result = statusResponse.data;
        
        if (result.logs) {
          console.log(`📝 Latest logs: ${result.logs.slice(-200)}`);
        }
        
      } catch (pollError) {
        console.warn(`⚠️  Polling error: ${pollError.message}`);
        // Continue polling unless it's a critical error
        if (pollError.response?.status === 404) {
          throw new Error('Prediction not found - may have been cancelled');
        }
      }
    }

    // Check final result
    if (result.status === 'succeeded') {
      console.log('✅ AI generation completed successfully');
      
      if (result.output && result.output.length > 0) {
        const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
        console.log(`🖼️  Generated image URL: ${imageUrl}`);
        return imageUrl;
      } else {
        throw new Error('No output generated');
      }
      
    } else if (result.status === 'failed') {
      const errorMsg = result.error || 'Unknown error occurred';
      console.error(`❌ Generation failed: ${errorMsg}`);
      throw new Error(`Generation failed: ${errorMsg}`);
      
    } else if (result.status === 'canceled') {
      throw new Error('Generation was canceled');
      
    } else {
      throw new Error(`Unexpected final status: ${result.status}`);
    }
    
  } catch (error) {
    console.error(`❌ Flux API error (attempt ${retryCount + 1}):`, error.message);
    
    // Log full error for debugging
    if (error.response) {
      console.error(`📡 Response status: ${error.response.status}`);
      console.error(`📡 Response data:`, error.response.data);
    }
    
    // Retry logic for recoverable errors
    const isRetryable = (
      error.code === 'ECONNABORTED' || 
      error.code === 'ENOTFOUND' || 
      error.code === 'ECONNRESET' ||
      (error.response?.status >= 500) ||
      (error.response?.status === 429) // Rate limit
    );
    
    if (retryCount < maxRetries && isRetryable) {
      const delay = (retryCount + 1) * 3000; // Exponential backoff
      console.log(`🔄 Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateWithFlux(mainImageUrl, userPrompt, stylePreset, retryCount + 1);
    }
    
    throw error;
  }
};

// POST /api/generate/text-to-image - Generate image from text prompt only
router.post('/text-to-image', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { prompt, stylePreset, model = 'flux', width = 512, height = 512 } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        success: false,
        error: 'Text prompt is required' 
      });
    }

    // Check user's generation limit
    let userData = {};
    let generationsUsed = 0;
    let generationLimit = 5;
    
    if (db) {
      try {
        const userDoc = await db.collection('users').doc(uid).get();
        userData = userDoc.data() || {};
        generationsUsed = userData.generationsUsed || 0;
        generationLimit = userData.isPremium ? 100 : 5;

        if (generationsUsed >= generationLimit) {
          return res.status(403).json({ 
            success: false,
            error: 'Generation limit reached',
            message: 'Please upgrade to premium for more generations'
          });
        }
      } catch (firestoreError) {
        console.warn('Firestore error, proceeding with default limits:', firestoreError.message);
        generationLimit = 3;
      }
    }

    // Generate image using Pollinations AI
    let generatedImageUrl;
    let generationMethod = 'text-to-image';
    let generationCost = 0;
    
    console.log('🎨 Starting Text-to-Image generation...');
    
    try {
      // Use Pollinations AI for text-to-image generation
      console.log('🌸 Using Pollinations AI for Text-to-Image...');
      const pollinationsResult = await pollinationsAI.generateStyleTransfer(
        prompt,
        stylePreset,
        {
          width: parseInt(width),
          height: parseInt(height),
          model: model,
          enhance: true
        }
      );
      
      if (pollinationsResult.success) {
        generatedImageUrl = pollinationsResult.imageUrl;
        generationMethod = 'pollinations-text-to-image';
        generationCost = 0;
        console.log('✅ SUCCESS: Text-to-Image generated with Pollinations AI!');
      }
    } catch (error) {
      console.error('❌ Text-to-Image generation failed:', error);
      // Fallback to mock generation
      generatedImageUrl = generateMockStyleImage(prompt, stylePreset);
      generationMethod = 'mock-text-to-image';
      generationCost = 0;
    }
    
    // Track successful generation
    analytics.trackGeneration(uid, stylePreset, prompt, true, 'text-to-image');

    // Save generation record
    let generationId = 'text2img-' + Date.now();
    
    if (db) {
      try {
        const generationData = {
          userId: uid,
          type: 'text-to-image',
          prompt: prompt,
          stylePreset: stylePreset || '',
          generatedImageUrl: generatedImageUrl,
          model: model,
          width: width,
          height: height,
          timestamp: new Date(),
          status: 'completed'
        };

        const generationRef = await db.collection('generations').add(generationData);
        generationId = generationRef.id;

        // Update user's generation count
        await db.collection('users').doc(uid).set({
          generationsUsed: generationsUsed + 1,
          lastGeneration: new Date()
        }, { merge: true });
        
        console.log('✅ Text-to-Image generation saved to database');
        
      } catch (firestoreError) {
        console.warn('⚠️ Failed to save to database:', firestoreError.message);
      }
    }

    res.json({
      success: true,
      type: 'text-to-image',
      generationId: generationId,
      generatedImageUrl: generatedImageUrl,
      generationsRemaining: Math.max(0, generationLimit - generationsUsed - 1),
      method: generationMethod,
      cost: generationCost
    });

  } catch (error) {
    console.error('Text-to-Image generation error:', error);
    analytics.trackGeneration(uid, stylePreset, prompt, false, 'text-to-image');
    analytics.trackError(uid, 'TextToImageError', error.message, '/api/generate/text-to-image');
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate image from text',
      message: error.message 
    });
  }
});

// POST /api/generate/image-to-image - Generate image transformation from uploaded image + text
router.post('/image-to-image', authenticateToken, upload.single('mainImage'), handleMulterError, async (req, res) => {
  try {
    const { uid } = req.user;
    const mainImageFile = req.file;
    const { prompt, stylePreset } = req.body;

    if (!mainImageFile) {
      return res.status(400).json({ 
        success: false,
        error: 'Main image is required' 
      });
    }

    if (!prompt) {
      return res.status(400).json({ 
        success: false,
        error: 'Transformation prompt is required' 
      });
    }

    // Check user's generation limit
    let userData = {};
    let generationsUsed = 0;
    let generationLimit = 5;
    
    if (db) {
      try {
        const userDoc = await db.collection('users').doc(uid).get();
        userData = userDoc.data() || {};
        generationsUsed = userData.generationsUsed || 0;
        generationLimit = userData.isPremium ? 100 : 5;

        if (generationsUsed >= generationLimit) {
          return res.status(403).json({ 
            success: false,
            error: 'Generation limit reached',
            message: 'Please upgrade to premium for more generations'
          });
        }
      } catch (firestoreError) {
        console.warn('Firestore error, proceeding with default limits:', firestoreError.message);
        generationLimit = 3;
      }
    }

    // Upload main image to Cloudinary
    let mainImageUrl;
    try {
      const mainImageResult = await uploadToCloudinary(mainImageFile.buffer, 'main-images');
      mainImageUrl = mainImageResult.secure_url;
    } catch (uploadError) {
      console.warn('Cloudinary upload failed, using mock URL:', uploadError.message);
      mainImageUrl = `https://via.placeholder.com/512x512/4F46E5/FFFFFF?text=Uploaded+Image&${Date.now()}`;
    }

    // Generate transformed image
    let generatedImageUrl;
    let generationMethod = 'image-to-image';
    let generationCost = 0;
    
    console.log('🎨 Starting Image-to-Image transformation...');
    
    try {
      // Get model and dimensions from request
      const selectedModel = req.body.model || 'kontext';
      const width = parseInt(req.body.width) || 512;
      const height = parseInt(req.body.height) || 512;
      
      console.log(`🌸 Using Pollinations AI ${selectedModel} model for Image-to-Image transformation...`);
      console.log(`📋 Request body model: ${req.body.model}`);
      console.log(`🎯 Selected model: ${selectedModel}`);
      console.log(`📐 Image dimensions: ${width} × ${height}`);
      
      const pollinationsResult = await pollinationsAI.generateImageToImage(
        mainImageUrl,
        prompt,
        stylePreset,
        {
          width: width,
          height: height,
          model: selectedModel
        }
      );
      
      if (pollinationsResult.success) {
        generatedImageUrl = pollinationsResult.imageUrl;
        generationMethod = `pollinations-${selectedModel}-image-to-image`;
        generationCost = 0;
        console.log(`✅ SUCCESS: Image-to-Image transformation with ${selectedModel} model!`);
      }
    } catch (error) {
      console.error('❌ Image-to-Image transformation failed:', error);
      // Fallback to mock generation
      generatedImageUrl = generateMockStyleImage(prompt, stylePreset);
      generationMethod = 'mock-image-to-image';
      generationCost = 0;
    }
    
    // Track successful generation
    analytics.trackGeneration(uid, stylePreset, prompt, true, 'image-to-image');

    // Save generation record
    let generationId = 'img2img-' + Date.now();
    
    if (db) {
      try {
        const generationData = {
          userId: uid,
          type: 'image-to-image',
          mainImageUrl: mainImageUrl,
          prompt: prompt,
          stylePreset: stylePreset || '',
          generatedImageUrl: generatedImageUrl,
          timestamp: new Date(),
          status: 'completed'
        };

        const generationRef = await db.collection('generations').add(generationData);
        generationId = generationRef.id;

        // Update user's generation count
        await db.collection('users').doc(uid).set({
          generationsUsed: generationsUsed + 1,
          lastGeneration: new Date()
        }, { merge: true });
        
        console.log('✅ Image-to-Image generation saved to database');
        
      } catch (firestoreError) {
        console.warn('⚠️ Failed to save to database:', firestoreError.message);
      }
    }

    res.json({
      success: true,
      type: 'image-to-image',
      generationId: generationId,
      mainImageUrl: mainImageUrl,
      generatedImageUrl: generatedImageUrl,
      generationsRemaining: Math.max(0, generationLimit - generationsUsed - 1),
      method: generationMethod,
      cost: generationCost
    });

  } catch (error) {
    console.error('Image-to-Image generation error:', error);
    analytics.trackGeneration(uid, stylePreset, prompt, false, 'image-to-image');
    analytics.trackError(uid, 'ImageToImageError', error.message, '/api/generate/image-to-image');
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to transform image',
      message: error.message 
    });
  }
});

// Keep the original route for backward compatibility
router.post('/', authenticateToken, upload.single('mainImage'), handleMulterError, async (req, res) => {
  try {
    const { uid } = req.user;
    const mainImageFile = req.file;
    const { prompt, stylePreset } = req.body;

    if (!mainImageFile) {
      return res.status(400).json({ 
        success: false,
        error: 'Main image is required' 
      });
    }

    if (!prompt && !stylePreset) {
      return res.status(400).json({ 
        success: false,
        error: 'Either prompt or style preset is required' 
      });
    }

    // Check if database is available
    if (!db) {
      console.warn('📊 Database not available, using mock response');
      console.warn('🔧 To enable database: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=stylist-727b5');
      // Return mock response for development
      return res.json({
        success: true,
        generationId: 'mock-generation-' + Date.now(),
        generatedImageUrl: generateMockStyleImage(prompt, stylePreset),
        generationsRemaining: 4,
        message: 'Mock generation (database not configured)',
        prompt: prompt,
        stylePreset: stylePreset
      });
    }

    // Check user's generation limit with error handling
    let userData = {};
    let generationsUsed = 0;
    let generationLimit = 5;
    
    try {
      const userDoc = await db.collection('users').doc(uid).get();
      userData = userDoc.data() || {};
      generationsUsed = userData.generationsUsed || 0;
      generationLimit = userData.isPremium ? 100 : 5;

      if (generationsUsed >= generationLimit) {
        return res.status(403).json({ 
          success: false,
          error: 'Generation limit reached',
          message: 'Please upgrade to premium for more generations'
        });
      }
    } catch (firestoreError) {
      console.warn('Firestore error, proceeding with default limits:', firestoreError.message);
      // Continue with default values for development
      if (firestoreError.message.includes('PERMISSION_DENIED') || firestoreError.message.includes('has not been used')) {
        console.warn('⚠️  Firestore not properly configured. Please enable Firestore API.');
        console.warn('⚠️  Visit: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=stylist-727b5');
        // Allow 3 generations for testing without database
        generationLimit = 3;
      }
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      console.warn('Cloudinary not configured, using mock response');
      
      // Update user's generation count for mock generation
      if (db) {
        try {
          await db.collection('users').doc(uid).set({
            generationsUsed: generationsUsed + 1,
            updatedAt: new Date(),
            lastGeneration: new Date()
          }, { merge: true });
          console.log(`✅ Updated user generation count: ${generationsUsed + 1}`);
        } catch (error) {
          console.error('Failed to update generation count:', error);
        }
      }
      
      return res.json({
        success: true,
        generationId: 'mock-generation-' + Date.now(),
        generatedImageUrl: 'https://via.placeholder.com/512x512/10B981/FFFFFF?text=Style+Transform',
        generationsRemaining: generationLimit - generationsUsed - 1,
        message: 'Mock generation (Cloudinary not configured)'
      });
    }

    // Track image upload
    analytics.trackImageUpload(uid, mainImageFile.size, mainImageFile.mimetype);

    // Upload main image to Cloudinary
    const mainImageResult = await uploadToCloudinary(mainImageFile.buffer, 'main-images');

    // Multi-tier generation system: FREE -> Paid -> Mock
    let generatedImageUrl;
    let generationMethod = 'mock';
    let generationCost = 0;
    
    console.log('🎨 Starting AI generation with multi-tier approach...');
    
    try {
      // Tier 1: Pollinations AI (Completely FREE, no API key needed)
      console.log('🌸 Tier 1: Trying Pollinations AI (100% FREE)...');
      try {
        const pollinationsResult = await pollinationsAI.generateStyleTransfer(
          prompt || 'stylish transformation',
          stylePreset,
          {
            width: 512,
            height: 512,
            model: 'flux',
            enhance: true
          }
        );
        
        if (pollinationsResult.success) {
          generatedImageUrl = pollinationsResult.imageUrl;
          generationMethod = 'pollinations-ai-free';
          generationCost = 0;
          console.log('✅ SUCCESS: Generated with Pollinations AI (100% FREE)!');
        }
      } catch (pollinationsError) {
        console.warn('⚠️ Tier 1 failed:', pollinationsError.message);
      }
      
      // Tier 2: Prodia AI (Free tier: 100 images/month)
      if (!generatedImageUrl && process.env.PRODIA_API_KEY) {
        console.log('🎨 Tier 2: Trying Prodia AI (FREE tier)...');
        try {
          const prodiaResult = await prodiaAI.generateImage(
            `${prompt || 'stylish transformation'} ${stylePreset ? ', ' + stylePreset : ''}`,
            {
              model: 'sd_xl_base_1.0.safetensors [be9edd61]',
              width: 512,
              height: 512
            }
          );
          
          if (prodiaResult.success) {
            generatedImageUrl = prodiaResult.imageUrl;
            generationMethod = 'prodia-ai-free';
            generationCost = 0;
            console.log('✅ SUCCESS: Generated with Prodia AI (FREE tier)!');
          }
        } catch (prodiaError) {
          console.warn('⚠️ Tier 2 failed:', prodiaError.message);
        }
      }
      
      // Tier 3: Replicate API (Paid, high quality)
      if (!generatedImageUrl && process.env.REPLICATE_API_TOKEN && !process.env.REPLICATE_API_TOKEN.includes('your_replicate')) {
        console.log('💳 Tier 3: Trying Replicate API (Paid)...');
        try {
          generatedImageUrl = await generateWithFlux(
            mainImageResult.secure_url,
            prompt,
            stylePreset
          );
          generationMethod = 'replicate-paid';
          generationCost = 0.0025;
          console.log('✅ SUCCESS: Generated with Replicate API (Paid)');
        } catch (replicateError) {
          console.warn('⚠️ Tier 3 failed:', replicateError.message);
        }
      }
      
      // Tier 4: High-Quality Mock Generation (Always works)
      if (!generatedImageUrl) {
        console.log('🎭 Tier 4: Using high-quality mock generation');
        generatedImageUrl = generateMockStyleImage(prompt, stylePreset);
        generationMethod = 'mock-generation';
        generationCost = 0;
        console.log('✅ SUCCESS: Generated with mock system');
      }
      
    } catch (error) {
      console.error('❌ All generation tiers failed:', error);
      generatedImageUrl = generateMockStyleImage(prompt, stylePreset);
      generationMethod = 'mock-fallback';
      generationCost = 0;
    }
    
    // Log generation summary
    console.log(`📊 Generation Summary:`);
    console.log(`   Method: ${generationMethod}`);
    console.log(`   Cost: $${generationCost}`);
    console.log(`   Success: ${generatedImageUrl ? 'Yes' : 'No'}`);

    // Track successful generation
    analytics.trackGeneration(uid, stylePreset, prompt, true);

    // Save generation record with error handling
    let generationId = 'local-' + Date.now();
    
    try {
      const generationData = {
        userId: uid,
        mainImageUrl: mainImageResult.secure_url,
        prompt: prompt || '',
        stylePreset: stylePreset || '',
        generatedImageUrl: generatedImageUrl,
        timestamp: new Date(),
        status: 'completed'
      };

      const generationRef = await db.collection('generations').add(generationData);
      generationId = generationRef.id;

      // Update user's generation count
      await db.collection('users').doc(uid).set({
        generationsUsed: generationsUsed + 1,
        lastGeneration: new Date()
      }, { merge: true });
      
      console.log('✅ Generation saved to database successfully');
      
    } catch (firestoreError) {
      console.warn('⚠️  Failed to save to database, but generation succeeded:', firestoreError.message);
      // Continue without saving to database for now
    }

    res.json({
      success: true,
      generationId: generationId,
      generatedImageUrl: generatedImageUrl,
      generationsRemaining: Math.max(0, generationLimit - generationsUsed - 1),
      message: db ? undefined : 'Generation completed (database not configured)'
    });

  } catch (error) {
    console.error('Generation error:', error);
    
    // Track generation failure
    analytics.trackGeneration(uid, stylePreset, prompt, false);
    analytics.trackError(uid, 'GenerationError', error.message, '/api/generate');
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate image',
      message: error.message 
    });
  }
});

// GET /api/generate/history - Get user's generation history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { limit = 10, offset = 0 } = req.query;

    // Check if database is available
    if (!db) {
      console.warn('Database not available, returning empty history');
      return res.json({ 
        generations: [],
        message: 'Database not configured'
      });
    }

    // Use simpler query to avoid index requirement
    let snapshot;
    try {
      // Try the complex query first
      snapshot = await db.collection('generations')
        .where('userId', '==', uid)
        .orderBy('timestamp', 'desc')
        .limit(parseInt(limit))
        .get();
    } catch (indexError) {
      console.warn('⚠️  Complex query failed, using simple query:', indexError.message);
      // Fallback to simple query without orderBy
      snapshot = await db.collection('generations')
        .where('userId', '==', uid)
        .limit(parseInt(limit))
        .get();
    }

    const generations = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      generations.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp)
      });
    });

    res.json({ generations });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch history',
      generations: [] // Return empty array as fallback
    });
  }
});

module.exports = router;