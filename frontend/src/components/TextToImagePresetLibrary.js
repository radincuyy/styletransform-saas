import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TextToImagePresetLibrary = ({ selectedPreset, onPresetSelect, disabled = false }) => {
  const [activeCategory, setActiveCategory] = useState('characters');
  const [hoveredPreset, setHoveredPreset] = useState(null);


  const presetLibrary = {
    characters: {
      name: 'Character Concepts',
      icon: '👤',
      presets: [
        {
          id: 'fantasy-elf-warrior',
          name: 'Fantasy Elf Warrior',
          preview: '🧝‍♀️',
          prompt: 'Fantasy elf female warrior, silver armor with green cape, long blond hair, pointed ears, elegant sword, mystical forest background, high-detail fantasy art style, full body portrait',
          description: 'Elegant elven warrior in mystical armor'
        },
        {
          id: 'cyberpunk-hacker',
          name: 'Cyberpunk Hacker',
          preview: '🤖',
          prompt: 'Cyberpunk hacker character, neon-lit urban setting, futuristic clothing, glowing cybernetic implants, holographic displays, dark atmosphere, high-tech aesthetic, digital art style',
          description: 'Futuristic hacker in neon-lit city'
        },
        {
          id: 'anime-schoolgirl',
          name: 'Anime School Girl',
          preview: '👧',
          prompt: 'Anime style school girl, Japanese high school uniform, long black hair with bangs, cute expression, cherry blossom background, soft lighting, anime art style, detailed illustration',
          description: 'Cute anime student character'
        },
        {
          id: 'medieval-knight',
          name: 'Medieval Knight',
          preview: '⚔️',
          prompt: 'Medieval knight in shining armor, holding sword and shield, castle background, heroic pose, detailed metal armor, epic fantasy style, dramatic lighting, full body portrait',
          description: 'Heroic medieval knight warrior'
        },
        {
          id: 'space-explorer',
          name: 'Space Explorer',
          preview: '🚀',
          prompt: 'Space explorer in futuristic spacesuit, alien planet landscape, multiple moons in sky, sci-fi technology, cosmic atmosphere, detailed space suit, science fiction art style',
          description: 'Adventurous space explorer'
        },
        {
          id: 'witch-sorceress',
          name: 'Witch Sorceress',
          preview: '🧙‍♀️',
          prompt: 'Mystical witch sorceress, flowing dark robes, magical staff with glowing crystal, spell casting pose, enchanted forest, magical aura, fantasy art style, mysterious atmosphere',
          description: 'Powerful magical sorceress'
        }
      ]
    },
    fashion: {
      name: 'Fashion & Style',
      icon: '👗',
      presets: [
        {
          id: 'haute-couture-gown',
          name: 'Haute Couture Gown',
          preview: '👑',
          prompt: 'Elegant haute couture evening gown, luxurious fabric, intricate beadwork, fashion runway setting, professional fashion photography, high-end fashion style, dramatic lighting',
          description: 'Luxury high-fashion evening wear'
        },
        {
          id: 'streetwear-urban',
          name: 'Urban Streetwear',
          preview: '🏙️',
          prompt: 'Modern urban streetwear outfit, oversized hoodie and cargo pants, sneakers, city street background, contemporary fashion, street photography style, urban aesthetic',
          description: 'Trendy urban street fashion'
        },
        {
          id: 'vintage-1950s',
          name: 'Vintage 1950s Style',
          preview: '🕺',
          prompt: 'Vintage 1950s fashion, polka dot dress with petticoat, victory rolls hairstyle, retro accessories, classic diner background, pin-up style, nostalgic atmosphere',
          description: 'Classic 1950s vintage fashion'
        },
        {
          id: 'bohemian-chic',
          name: 'Bohemian Chic',
          preview: '🌻',
          prompt: 'Bohemian chic outfit, flowing maxi dress, layered jewelry, flower crown, natural outdoor setting, earthy tones, free-spirited style, soft natural lighting',
          description: 'Free-spirited bohemian style'
        },
        {
          id: 'gothic-lolita',
          name: 'Gothic Lolita',
          preview: '🖤',
          prompt: 'Gothic lolita fashion, black frilly dress with white lace, platform boots, dark makeup, Victorian-inspired accessories, dramatic gothic style, elegant darkness',
          description: 'Elegant gothic lolita fashion'
        },
        {
          id: 'minimalist-modern',
          name: 'Minimalist Modern',
          preview: '⚪',
          prompt: 'Minimalist modern fashion, clean lines, neutral colors, simple elegant design, contemporary style, professional photography, sophisticated aesthetic, urban setting',
          description: 'Clean minimalist fashion'
        }
      ]
    },
    environments: {
      name: 'Environments & Scenes',
      icon: '🏞️',
      presets: [
        {
          id: 'mystical-forest',
          name: 'Mystical Forest',
          preview: '🌲',
          prompt: 'Mystical enchanted forest, ancient trees with glowing mushrooms, magical mist, fairy lights, ethereal atmosphere, fantasy landscape, detailed nature art, magical realism',
          description: 'Enchanted magical forest scene'
        },
        {
          id: 'cyberpunk-city',
          name: 'Cyberpunk City',
          preview: '🌃',
          prompt: 'Cyberpunk cityscape at night, neon signs and holographic advertisements, flying cars, towering skyscrapers, rain-soaked streets, futuristic architecture, sci-fi atmosphere',
          description: 'Futuristic neon-lit cityscape'
        },
        {
          id: 'underwater-palace',
          name: 'Underwater Palace',
          preview: '🏰',
          prompt: 'Underwater crystal palace, coral gardens, swimming fish, bioluminescent plants, sunlight filtering through water, aquatic fantasy, detailed underwater scene',
          description: 'Majestic underwater kingdom'
        },
        {
          id: 'space-station',
          name: 'Space Station',
          preview: '🛸',
          prompt: 'Futuristic space station interior, high-tech control panels, large windows showing stars and planets, zero gravity environment, sci-fi technology, cosmic atmosphere',
          description: 'Advanced space station facility'
        },
        {
          id: 'steampunk-workshop',
          name: 'Steampunk Workshop',
          preview: '⚙️',
          prompt: 'Victorian steampunk workshop, brass gears and copper pipes, steam-powered machinery, vintage tools, warm amber lighting, industrial Victorian aesthetic',
          description: 'Victorian steampunk laboratory'
        },
        {
          id: 'cherry-blossom-garden',
          name: 'Cherry Blossom Garden',
          preview: '🌸',
          prompt: 'Japanese cherry blossom garden, pink sakura petals falling, traditional wooden bridge, koi pond, peaceful zen atmosphere, spring season, soft natural lighting',
          description: 'Serene Japanese garden scene'
        }
      ]
    },
    artistic: {
      name: 'Artistic Styles',
      icon: '🎨',
      presets: [
        {
          id: 'oil-painting-portrait',
          name: 'Oil Painting Portrait',
          preview: '🖼️',
          prompt: 'Classical oil painting portrait, Renaissance style, rich colors and textures, masterful brushwork, dramatic chiaroscuro lighting, museum quality artwork, traditional art technique',
          description: 'Classical Renaissance-style portrait'
        },
        {
          id: 'watercolor-landscape',
          name: 'Watercolor Landscape',
          preview: '🎨',
          prompt: 'Watercolor landscape painting, soft flowing colors, natural scenery, artistic brush strokes, transparent layers, impressionistic style, peaceful countryside scene',
          description: 'Soft watercolor nature scene'
        },
        {
          id: 'digital-concept-art',
          name: 'Digital Concept Art',
          preview: '💻',
          prompt: 'Digital concept art, highly detailed illustration, professional game art style, dynamic composition, rich colors, fantasy or sci-fi theme, concept design artwork',
          description: 'Professional digital concept art'
        },
        {
          id: 'anime-manga-style',
          name: 'Anime Manga Style',
          preview: '🎌',
          prompt: 'Anime manga art style, cel-shaded illustration, vibrant colors, expressive character design, Japanese animation aesthetic, detailed anime artwork, manga illustration',
          description: 'Japanese anime/manga artwork'
        },
        {
          id: 'photorealistic-render',
          name: 'Photorealistic Render',
          preview: '📷',
          prompt: 'Photorealistic 3D render, ultra-high detail, realistic lighting and shadows, professional 3D modeling, lifelike textures, architectural visualization quality',
          description: 'Ultra-realistic 3D rendering'
        },
        {
          id: 'abstract-modern-art',
          name: 'Abstract Modern Art',
          preview: '🌈',
          prompt: 'Abstract modern art, geometric shapes and flowing forms, vibrant color palette, contemporary artistic expression, non-representational art, creative composition',
          description: 'Contemporary abstract artwork'
        }
      ]
    }
  };

  const categories = Object.keys(presetLibrary);

  const handlePresetClick = (preset) => {
    if (disabled) return;
    onPresetSelect(preset);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
      
      {/* Floating Background Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-gradient-to-br from-pink-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse delay-500" />

      {/* Main Container with Glassmorphism */}
      <motion.div 
        className="relative backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl shadow-2xl p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        }}
        whileHover={{ 
          scale: 1.01,
          boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Header Section */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <motion.h3 
            className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            🎨 Text-to-Image Preset Library
          </motion.h3>
          <motion.p 
            className="text-gray-600 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Choose a preset to automatically generate professional prompts for stunning AI artwork
          </motion.p>
        </motion.div>

        {/* 3D Category Tabs */}
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {categories.map((category, index) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              disabled={disabled}
              className={`relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform-gpu ${
                activeCategory === category
                  ? 'text-white shadow-lg'
                  : 'text-gray-700 hover:text-white'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
              style={{
                background: activeCategory === category 
                  ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #3B82F6 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%)',
                backdropFilter: 'blur(10px)',
                border: activeCategory === category 
                  ? '1px solid rgba(255,255,255,0.3)' 
                  : '1px solid rgba(255,255,255,0.2)',
                boxShadow: activeCategory === category 
                  ? '0 8px 32px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  : '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
              whileHover={{
                scale: disabled ? 1 : 1.05,
                rotateY: disabled ? 0 : 5,
                background: activeCategory !== category 
                  ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #3B82F6 100%)'
                  : undefined
              }}
              whileTap={{ scale: disabled ? 1 : 0.95 }}
              initial={{ opacity: 0, rotateX: -90 }}
              animate={{ opacity: 1, rotateX: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <motion.span 
                  className="text-lg"
                  animate={{ rotate: activeCategory === category ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {presetLibrary[category].icon}
                </motion.span>
                {presetLibrary[category].name}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* 3D Preset Grid */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeCategory}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {presetLibrary[activeCategory].presets.map((preset, index) => (
              <motion.div
                key={preset.id}
                onClick={() => handlePresetClick(preset)}
                onMouseEnter={() => setHoveredPreset(preset.id)}
                onMouseLeave={() => setHoveredPreset(null)}
                className={`relative p-6 rounded-xl cursor-pointer transition-all duration-300 transform-gpu ${
                  selectedPreset?.id === preset.id
                    ? 'ring-2 ring-purple-500'
                    : ''
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{
                  background: selectedPreset?.id === preset.id
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 50%, rgba(59, 130, 246, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: selectedPreset?.id === preset.id 
                    ? '2px solid rgba(139, 92, 246, 0.3)' 
                    : '1px solid rgba(255,255,255,0.2)',
                  boxShadow: hoveredPreset === preset.id
                    ? '0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    : '0 8px 25px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
                whileHover={{
                  scale: disabled ? 1 : 1.05,
                  rotateY: disabled ? 0 : 5,
                  rotateX: disabled ? 0 : 5,
                  y: disabled ? 0 : -5
                }}
                whileTap={{ scale: disabled ? 1 : 0.95 }}
                initial={{ opacity: 0, y: 20, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                {/* Animated Border */}
                {selectedPreset?.id === preset.id && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'linear-gradient(45deg, #8B5CF6, #EC4899, #3B82F6, #8B5CF6)',
                      backgroundSize: '300% 300%'
                    }}
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                )}
                
                <div className="relative z-10 text-center">
                  <motion.div 
                    className="text-4xl mb-3"
                    animate={{ 
                      scale: hoveredPreset === preset.id ? 1.2 : 1,
                      rotate: hoveredPreset === preset.id ? 10 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {preset.preview}
                  </motion.div>
                  
                  <motion.h4 
                    className="font-bold text-gray-900 mb-2 text-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    {preset.name}
                  </motion.h4>
                  
                  <motion.p 
                    className="text-sm text-gray-600 mb-4"
                    initial={{ opacity: 0.7 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {preset.description}
                  </motion.p>
                  
                  {selectedPreset?.id === preset.id && (
                    <motion.div 
                      className="rounded-lg p-3 mt-3"
                      style={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(139, 92, 246, 0.2)'
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-xs text-purple-800 font-medium">
                        <strong>Prompt:</strong> {preset.prompt.substring(0, 80)}...
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Hover Glow Effect */}
                {hoveredPreset === preset.id && (
                  <motion.div
                    className="absolute inset-0 rounded-xl opacity-50"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.2) 0%, transparent 70%)'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Selected Preset Display */}
        <AnimatePresence>
          {selectedPreset && (
            <motion.div 
              className="mt-8 p-6 rounded-xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                boxShadow: '0 8px 25px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              {/* Success Animation Background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-blue-400/20 to-green-400/20"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              <div className="relative z-10">
                <motion.div 
                  className="flex items-center mb-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.span 
                    className="text-green-600 mr-3 text-xl"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 0.5 }}
                  >
                    ✅
                  </motion.span>
                  <span className="font-bold text-green-800 text-lg">
                    Selected: {selectedPreset.name}
                  </span>
                </motion.div>
                
                <motion.p 
                  className="text-sm text-green-700 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <strong>Full Prompt:</strong> {selectedPreset.prompt}
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default TextToImagePresetLibrary;