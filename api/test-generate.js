// Simple test generate function without dependencies
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

  console.log('🚀 Test Generate API called');
  console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
  console.log('🔐 Headers:', JSON.stringify(req.headers, null, 2));

  try {
    const { prompt, type = 'text-to-image', settings = {} } = req.body;

    if (!prompt) {
      console.log('❌ No prompt provided');
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('🎨 Generating image...');
    console.log('📝 Prompt:', prompt);
    console.log('🔧 Type:', type);
    console.log('⚙️ Settings:', settings);

    // Simple direct Pollinations AI call without any dependencies
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
    
    const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`;
    console.log('🔗 Generated image URL:', generatedImageUrl);

    // Simple response without database or cloudinary
    const generation = {
      id: `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId: 'test-user',
      type,
      prompt,
      imageUrl: generatedImageUrl,
      thumbnailUrl: generatedImageUrl,
      settings,
      status: 'completed',
      createdAt: new Date(),
      completedAt: new Date()
    };

    console.log('🎉 Generation completed successfully!');
    res.status(200).json({
      success: true,
      generation
    });

  } catch (error) {
    console.error('❌ Test Generate API error:', error);
    res.status(500).json({ 
      error: 'Generation failed',
      message: error.message,
      stack: error.stack
    });
  }
}