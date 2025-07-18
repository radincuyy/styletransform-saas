import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PresetLibrary from '../components/PresetLibrary';
import LazyImage from '../components/LazyImage';
import SEOHead from '../components/SEOHead';
import toast from 'react-hot-toast';

const ImageToImage = () => {
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [selectedModel, setSelectedModel] = useState('kontext');
  const [dimensions, setDimensions] = useState({ width: 512, height: 512 });
  const [useOriginalSize, setUseOriginalSize] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState('');
  const [userStats, setUserStats] = useState(null);
  const [generationsRemaining, setGenerationsRemaining] = useState(5);

  // Load user stats on component mount
  useEffect(() => {
    const loadUserStats = async () => {
      if (!currentUser) return;

      try {
        const response = await api.get('/user');
        const userData = response.data.user || {};
        
        setUserStats(userData);
        const remaining = Math.max(0, (userData.generationLimit || 5) - (userData.generationsUsed || 0));
        setGenerationsRemaining(remaining);
      } catch (error) {
        console.error('Failed to load user stats:', error);
        // Set defaults if API fails
        setGenerationsRemaining(5);
      }
    };

    loadUserStats();
  }, [currentUser]);

  const availableModels = [
    { id: 'kontext', name: 'Kontext', description: 'Specialized for image-to-image transformations (seed tier)' }
  ];

  const dimensionPresets = [
    { width: 512, height: 512, label: 'Square (512x512)', icon: '⬜' },
    { width: 768, height: 512, label: 'Landscape (768x512)', icon: '📱' },
    { width: 512, height: 768, label: 'Portrait (512x768)', icon: '📱' },
    { width: 1024, height: 1024, label: 'Large Square (1024x1024)', icon: '🖼️' },
    { width: 1024, height: 768, label: 'HD Landscape (1024x768)', icon: '🖥️' },
    { width: 768, height: 1024, label: 'HD Portrait (768x1024)', icon: '📄' }
  ];

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setError('');
    
    // Create preview and detect image dimensions
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage({
          file: file,
          preview: e.target.result,
          name: file.name,
          size: file.size,
          width: img.width,
          height: img.height
        });
        
        // Auto-enable "Same as Original" if it's a reasonable size
        if (img.width <= 1024 && img.height <= 1024) {
          setUseOriginalSize(true);
          setDimensions({ width: img.width, height: img.height });
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    // Auto-fill prompt with preset prompt
    setPrompt(preset.prompt);
  };

  const handleGenerate = async () => {
    // Check generation limit first
    if (generationsRemaining <= 0) {
      toast.error('You have reached your generation limit. Please upgrade to continue.');
      setError('Generation limit reached. Please upgrade your plan to continue generating images.');
      return;
    }

    if (!originalImage) {
      setError('Please upload an image first');
      return;
    }

    // Use preset prompt if available, otherwise require manual prompt
    const finalPrompt = selectedPreset ? selectedPreset.prompt : prompt.trim();
    if (!finalPrompt) {
      setError('Please select a preset or enter a transformation prompt');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedImage(null);

    try {
      // Convert image to base64 for serverless function
      const imageBase64 = originalImage.preview;
      
      const response = await api.post('/generate', {
        prompt: finalPrompt,
        type: 'image-to-image',
        imageUrl: imageBase64,
        settings: {
          model: selectedModel,
          width: dimensions.width,
          height: dimensions.height,
          stylePreset: selectedPreset?.name || null
        },
        // Add preset information if available
        ...(selectedPreset && {
          presetId: selectedPreset.id,
          presetName: selectedPreset.name
        })
      });

      if (response.data.success) {
        setGeneratedImage({
          url: response.data.generation.generatedImageUrl || response.data.generation.imageUrl,
          prompt: finalPrompt,
          preset: selectedPreset,
          model: selectedModel,
          dimensions: dimensions,
          originalImage: originalImage.preview,
          generationId: response.data.generation.id
        });
        
        // Update remaining generations
        setGenerationsRemaining(prev => Math.max(0, prev - 1));
        toast.success('Image transformed successfully!');
      } else {
        setError(response.data.message || 'Generation failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
      setError(error.response?.data?.message || 'Failed to generate image');
      toast.error('Failed to transform image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage.url;
    link.download = `image-to-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAll = () => {
    setOriginalImage(null);
    setGeneratedImage(null);
    setPrompt('');
    setSelectedPreset(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <SEOHead 
        title="Image to Image Editor - AI Image Transformation"
        description="Transform and edit your images with AI. Upload an image and describe the changes you want - change styles, colors, backgrounds, and more."
        keywords="image to image, AI image editor, image transformation, photo editing"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Image to Image Editor
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your images with AI using our Preset Library! Choose from hairstyles, fashion, accessories, and aesthetic themes - 
              or describe custom changes. Upload your photo and let AI transform it with professional results.
            </p>
            <div className="mt-3 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg inline-block">
              🎨 Powered by Pollinations AI - Choose from 24+ presets or create custom transformations
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Generations remaining: <span className="font-semibold text-green-600">{generationsRemaining}</span>
            </div>
          </div>

          {/* Preset Library Section */}
          <div className="mb-8">
            <PresetLibrary
              selectedPreset={selectedPreset}
              onPresetSelect={handlePresetSelect}
              disabled={isGenerating}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Upload & Transform
                </h2>

                {/* Image Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Your Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                    {originalImage ? (
                      <div className="space-y-3">
                        <img
                          src={originalImage.preview}
                          alt="Original"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">{originalImage.name}</p>
                          <p>{(originalImage.size / 1024 / 1024).toFixed(2)} MB</p>
                          {originalImage.width && originalImage.height && (
                            <p className="text-blue-600 font-medium">
                              📐 {originalImage.width} × {originalImage.height} pixels
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                          disabled={isGenerating}
                        >
                          Change Image
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-4xl text-gray-400">📸</div>
                        <div>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-green-600 hover:text-green-700 font-medium"
                            disabled={isGenerating}
                          >
                            Click to upload
                          </button>
                          <p className="text-sm text-gray-500 mt-1">
                            or drag and drop
                          </p>
                        </div>
                        <p className="text-xs text-gray-400">
                          PNG, JPG, WebP up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isGenerating}
                  />
                </div>

                {/* Transformation Prompt */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe the Changes
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Change the hair color to blue, add sunglasses, change the background to a beach scene, make it look like anime style"
                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    disabled={isGenerating}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Be specific about what you want to change or transform.
                  </div>
                </div>

                {/* AI Model Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isGenerating}
                  >
                    {availableModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.description}
                      </option>
                    ))}
                  </select>
                  <div className="text-xs text-gray-500 mt-1">
                    🎯 Kontext is specialized for true image-to-image transformations using your uploaded image as reference
                  </div>
                </div>

                {/* Image Size Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Output Image Size
                  </label>
                  
                  {/* Same as Original Option */}
                  {originalImage && originalImage.width && originalImage.height && (
                    <div className="mb-3">
                      <button
                        onClick={() => {
                          setUseOriginalSize(true);
                          setDimensions({ width: originalImage.width, height: originalImage.height });
                        }}
                        disabled={isGenerating}
                        className={`w-full p-3 text-left border-2 rounded-lg transition-all ${
                          useOriginalSize && dimensions.width === originalImage.width && dimensions.height === originalImage.height
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        } ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center">
                          <span className="text-lg mr-2">🎯</span>
                          <div>
                            <div className="font-medium text-sm">Same as Original</div>
                            <div className="text-xs text-gray-500">
                              {originalImage.width} × {originalImage.height} pixels (Recommended)
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2">
                    {dimensionPresets.map((preset) => (
                      <button
                        key={`${preset.width}x${preset.height}`}
                        onClick={() => {
                          setUseOriginalSize(false);
                          setDimensions({ width: preset.width, height: preset.height });
                        }}
                        disabled={isGenerating}
                        className={`p-3 text-left border-2 rounded-lg transition-all ${
                          !useOriginalSize && dimensions.width === preset.width && dimensions.height === preset.height
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                        } ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{preset.icon}</span>
                          <div>
                            <div className="font-medium text-sm">{preset.label}</div>
                            <div className="text-xs text-gray-500">{preset.width} × {preset.height}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    📐 Selected: {dimensions.width} × {dimensions.height} pixels
                    {useOriginalSize && originalImage && (
                      <span className="text-blue-600 font-medium"> (Same as Original)</span>
                    )}
                  </div>
                </div>



                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !originalImage || (!selectedPreset && !prompt.trim())}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Transforming...</span>
                    </div>
                  ) : (
                    'Transform Image'
                  )}
                </button>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Result Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Transformation Result
                </h2>

                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Transforming your image...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take 1-2 minutes</p>
                  </div>
                ) : generatedImage ? (
                  <div className="space-y-6">
                    {/* Before/After Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Original</h3>
                        <img
                          src={generatedImage.originalImage}
                          alt="Original"
                          className="w-full rounded-lg shadow-md"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Transformed</h3>
                        <LazyImage
                          src={generatedImage.url}
                          alt="Transformed"
                          className="w-full rounded-lg shadow-md"
                        />
                      </div>
                    </div>
                    
                    {/* Transformation Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Transformation Details</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        {generatedImage.preset && (
                          <p><span className="font-medium">Preset Used:</span> {generatedImage.preset.preview} {generatedImage.preset.name}</p>
                        )}
                        <p><span className="font-medium">Transformation:</span> {generatedImage.prompt}</p>
                        <p><span className="font-medium">AI Model:</span> {availableModels.find(m => m.id === generatedImage.model)?.name || generatedImage.model} (Image-to-Image)</p>
                        <p><span className="font-medium">Output Size:</span> {generatedImage.dimensions.width} × {generatedImage.dimensions.height} pixels</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={handleDownload}
                        className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Download Result
                      </button>
                      <button
                        onClick={resetAll}
                        className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Start New
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg">
                    <div className="text-6xl text-gray-300 mb-4">🖼️</div>
                    <p className="text-gray-600 text-center">
                      Upload an image and describe the changes you want to see the transformation
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preset Categories Overview */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🎨 Preset Library Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">💇 Hairstyle Presets</h4>
                <p className="text-purple-700 text-sm">
                  Buzz Cut, Long Straight, Curly Taper, Twin Tails, Bob Cut, Man Bun
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">👔 Fashion Presets</h4>
                <p className="text-blue-700 text-sm">
                  Korean Streetwear, Gothic Style, Office Formal, Casual Chic, Vintage Retro
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">👓 Accessory Presets</h4>
                <p className="text-green-700 text-sm">
                  Stylish Glasses, Cool Sunglasses, Ear Piercings, Baseball Cap, Chain Necklace
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-2">🎨 Aesthetic Themes</h4>
                <p className="text-orange-700 text-sm">
                  Cyberpunk Neon, Vaporwave Retro, Anime Manga, Dark Academia, Cottagecore
                </p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                🚀 <strong>24+ Professional Presets</strong> - Each preset automatically generates optimized prompts for the best results
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageToImage;