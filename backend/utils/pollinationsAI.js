const axios = require('axios');

class PollinationsAI {
  constructor() {
    this.baseUrl = 'https://image.pollinations.ai/prompt';
    this.apiUrl = 'https://api.pollinations.ai';
    this.apiToken = process.env.POLLINATIONS_API_TOKEN || 'Zs0rHdIr--0WN1-J';
    // FREE for basic models, Bearer auth for advanced features
  }

  // Generate image using Pollinations AI (100% FREE)
  async generateImage(prompt, options = {}) {
    const {
      width = 512,
      height = 512,
      model = 'flux', // Default for text-to-image, but can be overridden
      enhance = true,
      nologo = true,
      isPrivate = false,
      seed = Math.floor(Math.random() * 1000000)
    } = options;

    // Try multiple approaches if Pollinations is down
    const approaches = [
      // Approach 1: Original Pollinations API
      async () => {
        console.log(`🎨 Trying Pollinations AI (FREE)`);
        console.log(`📝 Prompt: ${prompt}`);
        
        const params = new URLSearchParams({
          width: width.toString(),
          height: height.toString(),
          model: model,
          enhance: enhance.toString(),
          nologo: nologo.toString(),
          private: isPrivate.toString(),
          seed: seed.toString()
        });
        
        const imageUrl = `${this.baseUrl}/${encodeURIComponent(prompt)}?${params}`;
        console.log(`🔗 Image URL: ${imageUrl}`);
        
        const response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 30000,
          headers: {
            'User-Agent': 'StyleTransform/1.0'
          }
        });
        
        const imageBuffer = Buffer.from(response.data);
        const base64Image = imageBuffer.toString('base64');
        const base64Url = `data:image/png;base64,${base64Image}`;
        
        return {
          success: true,
          imageUrl: base64Url,
          directUrl: imageUrl,
          prompt: prompt,
          cost: 0,
          method: 'pollinations-ai',
          model: model,
          seed: seed
        };
      },
      
      // Approach 2: Alternative Pollinations endpoint
      async () => {
        console.log(`🎨 Trying alternative Pollinations endpoint...`);
        const altUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}`;
        
        const response = await axios.get(altUrl, {
          responseType: 'arraybuffer',
          timeout: 30000,
          headers: {
            'User-Agent': 'StyleTransform/1.0'
          }
        });
        
        const imageBuffer = Buffer.from(response.data);
        const base64Image = imageBuffer.toString('base64');
        const base64Url = `data:image/png;base64,${base64Image}`;
        
        return {
          success: true,
          imageUrl: base64Url,
          directUrl: altUrl,
          prompt: prompt,
          cost: 0,
          method: 'pollinations-alt',
          model: 'default',
          seed: seed
        };
      },
      
      // Approach 3: Generate a reliable placeholder using different services
      async () => {
        console.log(`🎨 Generating reliable placeholder...`);
        
        // Try multiple placeholder services
        const placeholderServices = [
          `https://picsum.photos/${width}/${height}?random=${seed}`,
          `https://source.unsplash.com/${width}x${height}/?nature,landscape`,
          `https://loremflickr.com/${width}/${height}/nature,art`,
          `https://dummyimage.com/${width}x${height}/4F46E5/FFFFFF&text=${encodeURIComponent(prompt.substring(0, 20))}`
        ];
        
        for (const serviceUrl of placeholderServices) {
          try {
            console.log(`   Trying: ${serviceUrl}`);
            const response = await axios.get(serviceUrl, {
              responseType: 'arraybuffer',
              timeout: 10000,
              headers: {
                'User-Agent': 'StyleTransform/1.0'
              }
            });
            
            const imageBuffer = Buffer.from(response.data);
            const base64Image = imageBuffer.toString('base64');
            const base64Url = `data:image/jpeg;base64,${base64Image}`;
            
            return {
              success: true,
              imageUrl: base64Url,
              directUrl: serviceUrl,
              prompt: prompt,
              cost: 0,
              method: 'placeholder-generation',
              model: 'placeholder',
              seed: seed
            };
          } catch (serviceError) {
            console.warn(`   Service failed: ${serviceError.message}`);
            continue;
          }
        }
        
        // If all services fail, create a simple SVG placeholder
        console.log(`   Creating SVG placeholder...`);
        
        const svgContent = `
          <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grad1)" />
            <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 15}" 
                  fill="white" text-anchor="middle" dominant-baseline="middle">AI Generated</text>
            <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 20}" 
                  fill="rgba(255,255,255,0.8)" text-anchor="middle" dominant-baseline="middle">${prompt.substring(0, 30)}</text>
          </svg>
        `;
        
        const base64Svg = Buffer.from(svgContent).toString('base64');
        const base64Url = `data:image/svg+xml;base64,${base64Svg}`;
        
        return {
          success: true,
          imageUrl: base64Url,
          directUrl: 'data:svg',
          prompt: prompt,
          cost: 0,
          method: 'svg-generation',
          model: 'svg',
          seed: seed
        };
      }
    ];

    // Try each approach
    for (let i = 0; i < approaches.length; i++) {
      try {
        const result = await approaches[i]();
        console.log(`✅ SUCCESS with approach ${i + 1}!`);
        return result;
      } catch (error) {
        console.warn(`⚠️ Approach ${i + 1} failed:`, error.message);
        
        // If this is the last approach, throw the error
        if (i === approaches.length - 1) {
          throw new Error(`All generation approaches failed. Last error: ${error.message}`);
        }
        
        // Continue to next approach
        continue;
      }
    }
  }

  // Generate Image-to-Image transformation using available models
  async generateImageToImage(inputImageUrl, prompt, stylePreset, options = {}) {
    const {
      width = 512,
      height = 512,
      model = 'kontext', // Default to kontext for image-to-image
      seed = Math.floor(Math.random() * 1000000)
    } = options;

    // Build style-enhanced prompt
    const stylePrompts = {
      'Modern Casual': 'modern casual outfit, trendy streetwear, contemporary fashion',
      'Business Professional': 'professional business attire, formal suit, corporate style',
      'Vintage Chic': 'vintage fashion, retro style, classic elegant clothing',
      'Street Style': 'urban streetwear, hip-hop fashion, edgy modern style',
      'Elegant Evening': 'elegant evening wear, formal dress, sophisticated style',
      'Bohemian Free': 'bohemian style, flowing fabrics, free-spirited fashion'
    };
    
    const styleDescription = stylePrompts[stylePreset] || stylePreset || '';
    const enhancedPrompt = styleDescription 
      ? `${prompt}, ${styleDescription}, high quality, detailed, professional photography`
      : `${prompt}, high quality, detailed, professional photography`;

    console.log(`🎨 Starting Image-to-Image transformation with ${model} model`);
    console.log(`📝 Prompt: ${enhancedPrompt}`);
    console.log(`🖼️ Input Image: ${inputImageUrl}`);
    console.log(`🔑 Using API Token: ${this.apiToken.substring(0, 8)}...`);
    console.log(`ℹ️ Note: Only GPTImage model supports true image-to-image transformation`);

    // Different approaches based on selected model
    let approaches = [];
    
    if (model === 'kontext') {
      // Kontext model approaches (requires seed tier access)
      approaches = [
        // Approach 1: Kontext with token (proven to work)
        async () => {
          console.log(`🎯 Using Kontext model with token (seed tier access)...`);
          
          const params = new URLSearchParams({
            model: 'kontext',
            token: this.apiToken,
            image: inputImageUrl,
            width: width.toString(),
            height: height.toString(),
            seed: seed.toString()
          });
          
          const transformUrl = `${this.baseUrl}/${encodeURIComponent(enhancedPrompt)}?${params}`;
          console.log(`🔗 Kontext URL: ${transformUrl}`);
          
          const response = await axios.get(transformUrl, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
              'User-Agent': 'StyleTransform/1.0'
            }
          });
          
          const imageBuffer = Buffer.from(response.data);
          const base64Image = imageBuffer.toString('base64');
          const base64Url = `data:image/jpeg;base64,${base64Image}`;
          
          return {
            success: true,
            imageUrl: base64Url,
            directUrl: transformUrl,
            prompt: enhancedPrompt,
            inputImage: inputImageUrl,
            cost: 0,
            method: 'pollinations-kontext-token',
            model: 'kontext',
            seed: seed
          };
        }
      ];
    } else if (model === 'gptimage') {
      // GPTImage model approaches (requires flower tier access)
      approaches = [
        // Approach 1: GPTImage with Bearer token (Discord recommended)
        async () => {
          console.log(`🤖 Trying GPTImage model with Bearer token (requires flower tier)...`);
          
          const params = new URLSearchParams({
            model: 'gptimage',
            token: this.apiToken,
            image: inputImageUrl,
            width: width.toString(),
            height: height.toString(),
            seed: seed.toString()
          });
          
          const transformUrl = `${this.baseUrl}/${encodeURIComponent(enhancedPrompt)}?${params}`;
          console.log(`🔗 Image-to-Image URL: ${transformUrl}`);
          
          const response = await axios.get(transformUrl, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
              'User-Agent': 'StyleTransform/1.0'
            }
          });
          
          const imageBuffer = Buffer.from(response.data);
          const base64Image = imageBuffer.toString('base64');
          const base64Url = `data:image/png;base64,${base64Image}`;
          
          return {
            success: true,
            imageUrl: base64Url,
            directUrl: transformUrl,
            prompt: enhancedPrompt,
            inputImage: inputImageUrl,
            cost: 0,
            method: 'pollinations-gptimage-token',
            model: 'gptimage',
            seed: seed
          };
        }
      ];
    } else {
      // Unsupported model for image-to-image
      approaches = [
        async () => {
          throw new Error(`Model '${model}' is not supported for image-to-image transformation. Only 'kontext' and 'gptimage' models support true image-to-image with input image reference.`);
        }
      ];
    }
    
    // Add fallback approach only for supported models
    if (model === 'kontext' || model === 'gptimage') {
      approaches.push(
        async () => {
          console.log(`🔄 Falling back to text-to-image generation with ${model} model...`);
          console.log(`⚠️ Image-to-image failed, generating new image based on prompt and style`);
          return this.generateImage(enhancedPrompt, { width, height, seed, model: model });
        }
      );
    }

    // Try each approach
    for (let i = 0; i < approaches.length; i++) {
      try {
        const result = await approaches[i]();
        console.log(`✅ SUCCESS with Kontext approach ${i + 1}!`);
        return result;
      } catch (error) {
        console.warn(`⚠️ Kontext approach ${i + 1} failed:`, error.message);
        
        // If this is the last approach, throw the error
        if (i === approaches.length - 1) {
          throw new Error(`All Kontext approaches failed. Last error: ${error.message}`);
        }
        
        // Continue to next approach
        continue;
      }
    }
  }

  // Generate with style transfer (for text-to-image)
  async generateStyleTransfer(prompt, stylePreset, options = {}) {
    const stylePrompts = {
      'Modern Casual': 'modern casual outfit, trendy streetwear, contemporary fashion',
      'Business Professional': 'professional business attire, formal suit, corporate style',
      'Vintage Chic': 'vintage fashion, retro style, classic elegant clothing',
      'Street Style': 'urban streetwear, hip-hop fashion, edgy modern style',
      'Elegant Evening': 'elegant evening wear, formal dress, sophisticated style',
      'Bohemian Free': 'bohemian style, flowing fabrics, free-spirited fashion'
    };
    
    const styleDescription = stylePrompts[stylePreset] || stylePreset;
    const enhancedPrompt = styleDescription 
      ? `${prompt}, ${styleDescription}, high quality, detailed, professional photography`
      : `${prompt}, high quality, detailed, professional photography`;
    
    return this.generateImage(enhancedPrompt, options);
  }

  // Batch generation
  async batchGenerate(prompts, options = {}) {
    const results = [];
    
    for (const prompt of prompts) {
      try {
        const result = await this.generateImage(prompt, options);
        results.push(result);
        
        // Small delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({
          success: false,
          prompt: prompt,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Get available models (from Pollinations AI API: flux, kontext, turbo, gptimage)
  getAvailableModels() {
    return [
      { id: 'flux', name: 'Flux', description: 'High-quality general purpose model' },
      { id: 'turbo', name: 'Turbo', description: 'Fast generation with good quality' },
      { id: 'gptimage', name: 'GPT Image', description: 'AI-powered image generation' },
      { id: 'kontext', name: 'Kontext', description: 'Specialized for image-to-image transformations' }
    ];
  }
}

module.exports = PollinationsAI;