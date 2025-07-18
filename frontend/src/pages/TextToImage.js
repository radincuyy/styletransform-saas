import React, { useState } from 'react';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import TextToImagePresetLibrary from '../components/TextToImagePresetLibrary';
import LazyImage from '../components/LazyImage';
import SEOHead from '../components/SEOHead';

const TextToImage = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [model, setModel] = useState('flux');
  const [dimensions, setDimensions] = useState({ width: 512, height: 512 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState('');
  const [generationsRemaining, setGenerationsRemaining] = useState(5);

  const availableModels = [
    { id: 'flux', name: 'Flux', description: 'High-quality general purpose model' },
    { id: 'turbo', name: 'Turbo', description: 'Fast generation with good quality' },
    { id: 'gptimage', name: 'GPT Image', description: 'AI-powered image generation' }
  ];

  const dimensionPresets = [
    { width: 512, height: 512, label: 'Square (512x512)', icon: '⬜' },
    { width: 768, height: 512, label: 'Landscape (768x512)', icon: '📱' },
    { width: 512, height: 768, label: 'Portrait (512x768)', icon: '📱' },
    { width: 1024, height: 1024, label: 'Large Square (1024x1024)', icon: '🖼️' },
    { width: 1024, height: 768, label: 'HD Landscape (1024x768)', icon: '🖥️' },
    { width: 768, height: 1024, label: 'HD Portrait (768x1024)', icon: '📄' }
  ];

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    // Auto-fill prompt with preset prompt
    setPrompt(preset.prompt);
  };

  const handleGenerate = async () => {
    // Use preset prompt if available, otherwise require manual prompt
    const finalPrompt = selectedPreset ? selectedPreset.prompt : prompt.trim();
    if (!finalPrompt) {
      setError('Please select a preset or enter a text prompt');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedImage(null);

    try {
      const response = await api.post('/generate', {
        prompt: finalPrompt,
        type: 'text-to-image',
        settings: {
          model: model,
          width: dimensions.width,
          height: dimensions.height
        },
        // Add preset information if available
        ...(selectedPreset && {
          presetId: selectedPreset.id,
          presetName: selectedPreset.name
        })
      });

      if (response.data.success) {
        setGeneratedImage({
          url: response.data.generation.imageUrl,
          prompt: finalPrompt,
          preset: selectedPreset,
          model: model,
          dimensions: dimensions,
          generationId: response.data.generation.id
        });
        // Keep current generations remaining for now
        // setGenerationsRemaining(response.data.generationsRemaining);
      } else {
        setError(response.data.message || 'Generation failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
      setError(error.response?.data?.message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage.url;
    link.download = `text-to-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <SEOHead
        title="Text to Image Generator - AI Image Creation"
        description="Generate stunning images from text descriptions using advanced AI. Create character references, artwork, and visual concepts with simple text prompts."
        keywords="text to image, AI image generator, character reference, artwork creation"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Text to Image Generator
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create stunning artwork from text with our Preset Library! Choose from 24+ professional presets
              for characters, fashion, environments, and artistic styles - or describe your own custom vision.
            </p>
            <div className="mt-3 text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-lg inline-block">
              🎨 24+ Professional Presets - Characters, Fashion, Environments & Artistic Styles
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Generations remaining: <span className="font-semibold text-blue-600">{generationsRemaining}</span>
            </div>
          </div>

          {/* Preset Library Section */}
          <div className="mb-8">
            <TextToImagePresetLibrary
              selectedPreset={selectedPreset}
              onPresetSelect={handlePresetSelect}
              disabled={isGenerating}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Create Your Image
              </h2>

              {/* Text Prompt */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe Your Image
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A beautiful anime character with blue hair wearing a modern casual outfit, standing in a cyberpunk city at night"
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={isGenerating}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Be descriptive! Include details about style, colors, setting, and mood.
                </div>
              </div>



              {/* Model Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isGenerating}
                >
                  {availableModels.map((modelOption) => (
                    <option key={modelOption.id} value={modelOption.id}>
                      {modelOption.name} - {modelOption.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Size Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Output Image Size
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {dimensionPresets.map((preset) => (
                    <button
                      key={`${preset.width}x${preset.height}`}
                      onClick={() => setDimensions({ width: preset.width, height: preset.height })}
                      disabled={isGenerating}
                      className={`p-3 text-left border-2 rounded-lg transition-all ${dimensions.width === preset.width && dimensions.height === preset.height
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
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
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Generating...</span>
                  </div>
                ) : (
                  'Generate Image'
                )}
              </button>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Result Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Generated Image
              </h2>

              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-gray-600">Creating your image...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take 30-60 seconds</p>
                </div>
              ) : generatedImage ? (
                <div className="space-y-4">
                  <div className="relative">
                    <LazyImage
                      src={generatedImage.url}
                      alt={generatedImage.prompt}
                      className="w-full rounded-lg shadow-md"
                      style={{ aspectRatio: `${generatedImage.dimensions.width}/${generatedImage.dimensions.height}` }}
                    />
                  </div>

                  {/* Image Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Generation Details</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Prompt:</span> {generatedImage.prompt}</p>
                      {generatedImage.preset && (
                        <p><span className="font-medium">Preset Used:</span> {generatedImage.preset.preview} {generatedImage.preset.name}</p>
                      )}
                      <p><span className="font-medium">Model:</span> {generatedImage.model}</p>
                      <p><span className="font-medium">Output Size:</span> {generatedImage.dimensions.width} × {generatedImage.dimensions.height} pixels</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDownload}
                      className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Download Image
                    </button>
                    <button
                      onClick={() => {
                        setGeneratedImage(null);
                        setPrompt('');
                        setSelectedPreset(null);
                      }}
                      className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Generate New
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg">
                  <div className="text-6xl text-gray-300 mb-4">🎨</div>
                  <p className="text-gray-600 text-center">
                    Enter a text prompt and click "Generate Image" to create your artwork
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Preset Categories Overview */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🎨 Text-to-Image Preset Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">👤 Character Concepts</h4>
                <p className="text-blue-700 text-sm">
                  Fantasy Elf Warrior, Cyberpunk Hacker, Anime School Girl, Medieval Knight, Space Explorer
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">👗 Fashion & Style</h4>
                <p className="text-purple-700 text-sm">
                  Haute Couture Gown, Urban Streetwear, Vintage 1950s, Bohemian Chic, Gothic Lolita
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">🏞️ Environments & Scenes</h4>
                <p className="text-green-700 text-sm">
                  Mystical Forest, Cyberpunk City, Underwater Palace, Space Station, Cherry Blossom Garden
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-2">🎨 Artistic Styles</h4>
                <p className="text-orange-700 text-sm">
                  Oil Painting Portrait, Watercolor Landscape, Digital Concept Art, Anime Manga Style
                </p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                🚀 <strong>24+ Professional Presets</strong> - Each preset generates optimized prompts for stunning AI artwork
              </p>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">💡 Pro Tips for Custom Prompts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">🎯 Be Specific</h4>
                <p className="text-blue-700 text-sm">
                  "Anime girl with blue hair" → "Anime girl with long flowing blue hair, golden eyes, school uniform"
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">🎨 Add Art Style</h4>
                <p className="text-green-700 text-sm">
                  Include: "digital art", "oil painting", "watercolor", "photorealistic", "anime style"
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">✨ Quality Boosters</h4>
                <p className="text-purple-700 text-sm">
                  Add: "high quality", "detailed", "masterpiece", "professional", "8k resolution"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TextToImage;