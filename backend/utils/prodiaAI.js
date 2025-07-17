const axios = require('axios');

class ProdiaAI {
  constructor() {
    this.baseUrl = 'https://api.prodia.com/v1';
    this.apiKey = process.env.PRODIA_API_KEY; // Free tier available
  }

  // Generate image using Prodia AI (Free tier: 100 images/month)
  async generateImage(prompt, options = {}) {
    const {
      model = 'sd_xl_base_1.0.safetensors [be9edd61]',
      steps = 20,
      cfg_scale = 7,
      width = 512,
      height = 512,
      negative_prompt = 'blurry, low quality, distorted, deformed, bad anatomy'
    } = options;

    if (!this.apiKey) {
      throw new Error('Prodia API key not configured. Get free key at https://prodia.com');
    }

    try {
      console.log(`🎨 Generating with Prodia AI (FREE)`);
      
      // Create generation job
      const createResponse = await axios.post(`${this.baseUrl}/sd/generate`, {
        prompt: prompt,
        negative_prompt: negative_prompt,
        model: model,
        steps: steps,
        cfg_scale: cfg_scale,
        width: width,
        height: height,
        seed: Math.floor(Math.random() * 1000000)
      }, {
        headers: {
          'X-Prodia-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const jobId = createResponse.data.job;
      console.log(`🆔 Job created: ${jobId}`);

      // Poll for completion
      let result;
      const maxAttempts = 30; // 5 minutes max
      
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        
        const statusResponse = await axios.get(`${this.baseUrl}/job/${jobId}`, {
          headers: {
            'X-Prodia-Key': this.apiKey
          }
        });
        
        result = statusResponse.data;
        console.log(`⏳ Status: ${result.status}`);
        
        if (result.status === 'succeeded') {
          break;
        } else if (result.status === 'failed') {
          throw new Error('Generation failed');
        }
      }

      if (result.status !== 'succeeded') {
        throw new Error('Generation timeout');
      }

      // Fetch the generated image
      const imageResponse = await axios.get(result.imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      const imageBuffer = Buffer.from(imageResponse.data);
      const base64Image = imageBuffer.toString('base64');
      const base64Url = `data:image/png;base64,${base64Image}`;

      return {
        success: true,
        imageUrl: base64Url,
        directUrl: result.imageUrl,
        prompt: prompt,
        cost: 0, // Free tier
        method: 'prodia-ai',
        model: model,
        jobId: jobId
      };

    } catch (error) {
      console.error('❌ Prodia AI error:', error.message);
      throw new Error(`Prodia AI generation failed: ${error.message}`);
    }
  }

  // Get available models
  getAvailableModels() {
    return [
      'sd_xl_base_1.0.safetensors [be9edd61]',
      'juggernaut_aftermath.safetensors [5e20c455]',
      'absolutereality_V16.safetensors [37db0fc3]',
      'dreamlike-anime-1.0.safetensors [4520e090]',
      'deliberate_v2.safetensors [10ec4b29]'
    ];
  }
}

module.exports = ProdiaAI;