import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PresetLibrary = ({ selectedPreset, onPresetSelect, disabled = false }) => {
  const [activeCategory, setActiveCategory] = useState('hairstyle');

  const presetLibrary = {
    hairstyle: {
      name: 'Hairstyle Presets',
      icon: '💇',
      presets: [
        {
          id: 'buzz-cut',
          name: 'Buzz Cut',
          preview: '👨‍🦲',
          prompt: 'Transform hairstyle to buzz cut, very short hair, clean military style cut, professional look',
          description: 'Clean, short military-style cut'
        },
        {
          id: 'long-straight',
          name: 'Long Straight',
          preview: '👩‍🦱',
          prompt: 'Transform hairstyle to long straight hair, sleek and smooth, shoulder length or longer, well-maintained',
          description: 'Sleek, long straight hair'
        },
        {
          id: 'curly-taper',
          name: 'Curly Taper Fade',
          preview: '👨‍🦱',
          prompt: 'Transform hairstyle to curly taper fade, curly hair on top, faded sides, modern trendy cut',
          description: 'Modern curly fade style'
        },
        {
          id: 'twin-tails',
          name: 'Twin Tails Anime',
          preview: '👧',
          prompt: 'Transform hairstyle to anime twin tails, two ponytails on sides, cute anime style, colorful hair',
          description: 'Cute anime twin tails'
        },
        {
          id: 'bob-cut',
          name: 'Bob Cut',
          preview: '👩‍🦰',
          prompt: 'Transform hairstyle to bob cut, chin-length hair, straight cut, classic bob style',
          description: 'Classic chin-length bob'
        },
        {
          id: 'man-bun',
          name: 'Man Bun',
          preview: '👨‍🎤',
          prompt: 'Transform hairstyle to man bun, long hair tied up in bun, trendy hipster style',
          description: 'Trendy man bun style'
        }
      ]
    },
    fashion: {
      name: 'Fashion Presets',
      icon: '👔',
      presets: [
        {
          id: 'korean-streetwear',
          name: 'Korean Streetwear',
          preview: '🇰🇷',
          prompt: 'Transform outfit to Korean streetwear style, oversized hoodie or jacket, trendy K-fashion, modern urban style',
          description: 'Trendy K-fashion streetwear'
        },
        {
          id: 'gothic-style',
          name: 'Gothic Style',
          preview: '🖤',
          prompt: 'Transform outfit to gothic style, dark clothing, black leather or lace, gothic fashion, dramatic look',
          description: 'Dark gothic fashion'
        },
        {
          id: 'office-formal',
          name: 'Office Formal',
          preview: '💼',
          prompt: 'Transform outfit to office formal wear, business suit, professional attire, corporate style',
          description: 'Professional business attire'
        },
        {
          id: 'casual-chic',
          name: 'Casual Chic',
          preview: '👕',
          prompt: 'Transform outfit to casual chic style, stylish casual wear, comfortable yet fashionable, modern casual',
          description: 'Stylish casual wear'
        },
        {
          id: 'vintage-retro',
          name: 'Vintage Retro',
          preview: '🕺',
          prompt: 'Transform outfit to vintage retro style, 70s or 80s fashion, retro clothing, classic vintage look',
          description: 'Classic vintage fashion'
        },
        {
          id: 'sporty-athletic',
          name: 'Sporty Athletic',
          preview: '🏃',
          prompt: 'Transform outfit to sporty athletic wear, gym clothes, athletic gear, fitness fashion',
          description: 'Athletic sportswear'
        }
      ]
    },
    accessories: {
      name: 'Accessory Presets',
      icon: '👓',
      presets: [
        {
          id: 'stylish-glasses',
          name: 'Stylish Glasses',
          preview: '🤓',
          prompt: 'Add stylish eyeglasses, trendy frames, intellectual look, fashionable spectacles',
          description: 'Trendy eyeglasses'
        },
        {
          id: 'sunglasses-cool',
          name: 'Cool Sunglasses',
          preview: '😎',
          prompt: 'Add cool sunglasses, aviator or wayfarer style, stylish shades, confident look',
          description: 'Stylish sunglasses'
        },
        {
          id: 'ear-piercings',
          name: 'Ear Piercings',
          preview: '💎',
          prompt: 'Add ear piercings, stylish earrings, multiple piercings, trendy ear jewelry',
          description: 'Trendy ear piercings'
        },
        {
          id: 'baseball-cap',
          name: 'Baseball Cap',
          preview: '🧢',
          prompt: 'Add baseball cap, casual hat, sporty cap, street style headwear',
          description: 'Casual baseball cap'
        },
        {
          id: 'beanie-hat',
          name: 'Beanie Hat',
          preview: '🎿',
          prompt: 'Add beanie hat, knit cap, winter hat, casual beanie style',
          description: 'Cozy beanie hat'
        },
        {
          id: 'necklace-chain',
          name: 'Chain Necklace',
          preview: '📿',
          prompt: 'Add chain necklace, stylish jewelry, gold or silver chain, fashionable accessory',
          description: 'Stylish chain necklace'
        }
      ]
    },
    aesthetic: {
      name: 'Aesthetic Themes',
      icon: '🎨',
      presets: [
        {
          id: 'cyberpunk-neon',
          name: 'Cyberpunk Neon',
          preview: '🌃',
          prompt: 'Transform to cyberpunk aesthetic, neon colors, futuristic style, cyber punk fashion, neon lighting effects',
          description: 'Futuristic cyberpunk style'
        },
        {
          id: 'vaporwave-retro',
          name: 'Vaporwave Retro',
          preview: '🌺',
          prompt: 'Transform to vaporwave aesthetic, retro 80s style, pastel colors, synthwave vibes, nostalgic look',
          description: 'Retro vaporwave vibes'
        },
        {
          id: 'vintage-film',
          name: 'Vintage Film',
          preview: '📸',
          prompt: 'Transform to vintage film aesthetic, old photo style, sepia tones, classic vintage photography',
          description: 'Classic vintage film look'
        },
        {
          id: 'anime-manga',
          name: 'Anime Manga',
          preview: '🎌',
          prompt: 'Transform to anime manga style, Japanese animation art, anime character design, manga illustration',
          description: 'Japanese anime/manga style'
        },
        {
          id: 'dark-academia',
          name: 'Dark Academia',
          preview: '📚',
          prompt: 'Transform to dark academia aesthetic, scholarly style, vintage academic fashion, intellectual look',
          description: 'Scholarly dark academia'
        },
        {
          id: 'cottagecore',
          name: 'Cottagecore',
          preview: '🌻',
          prompt: 'Transform to cottagecore aesthetic, rural countryside style, natural earthy tones, cozy cottage vibes',
          description: 'Cozy cottagecore style'
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
      className="relative backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-8 border border-white/20 overflow-hidden"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* 3D Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10"
      >
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              🎨 Preset Library
            </span>
          </h3>
          <p className="text-gray-600 text-lg">
            Choose a preset to automatically generate the perfect transformation prompt
          </p>
        </div>

        {/* 3D Category Tabs */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {categories.map((category, index) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              disabled={disabled}
              className={`group relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white/80 text-gray-700 hover:bg-white border border-gray-200 hover:shadow-md'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              whileHover={!disabled ? { 
                scale: 1.05, 
                rotateX: 5,
                y: -2
              } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <span className="relative z-10 flex items-center">
                <span className="text-xl mr-2">{presetLibrary[category].icon}</span>
                {presetLibrary[category].name}
              </span>
              
              {/* Glow Effect */}
              {activeCategory === category && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400 to-blue-500 opacity-30 blur-lg group-hover:opacity-50 transition-opacity"></div>
              )}
            </motion.button>
          ))}
        </div>

        {/* 3D Preset Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {presetLibrary[activeCategory].presets.map((preset, index) => (
            <motion.div
              key={preset.id}
              className="group relative"
              initial={{ opacity: 0, y: 30, rotateX: -10 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={!disabled ? { 
                y: -8,
                rotateX: 5,
                scale: 1.02
              } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              onClick={() => handlePresetClick(preset)}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* 3D Preset Card */}
              <div className={`relative backdrop-blur-sm bg-white/90 rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 overflow-hidden ${
                selectedPreset?.id === preset.id
                  ? 'border-green-500 bg-gradient-to-br from-green-50 to-blue-50 shadow-lg shadow-green-500/20'
                  : 'border-gray-200/50 hover:border-green-300 hover:bg-white hover:shadow-lg'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                
                {/* Selection Glow Effect */}
                {selectedPreset?.id === preset.id && (
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-transparent opacity-100 transition-opacity duration-300"></div>
                )}
                
                {/* 3D Icon Container */}
                <motion.div 
                  className="relative z-10 text-center"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="text-5xl mb-4 inline-block"
                    whileHover={{ 
                      rotateY: 360,
                      scale: 1.2
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    {preset.preview}
                  </motion.div>
                  
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">{preset.name}</h4>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{preset.description}</p>
                  
                  {/* Preview Prompt */}
                  {selectedPreset?.id === preset.id && (
                    <motion.div 
                      className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-3 mt-4 border border-green-200"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-xs text-green-800 font-medium">
                        <strong>Prompt Preview:</strong> {preset.prompt.substring(0, 80)}...
                      </p>
                    </motion.div>
                  )}
                </motion.div>

                {/* Selection Indicator */}
                {selectedPreset?.id === preset.id && (
                  <motion.div 
                    className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.4, type: "spring" }}
                  >
                    <span className="text-white text-xs font-bold">✓</span>
                  </motion.div>
                )}

                {/* 3D Border Effect */}
                <div className={`absolute inset-0 rounded-2xl border-2 ${
                  selectedPreset?.id === preset.id
                    ? 'border-green-500/40 shadow-lg shadow-green-500/20'
                    : 'border-transparent group-hover:border-green-300/40'
                } transition-all duration-300`}></div>
              </div>

              {/* 3D Shadow */}
              <div className={`absolute inset-0 rounded-2xl ${
                selectedPreset?.id === preset.id
                  ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20'
                  : 'bg-gradient-to-r from-gray-500/10 to-gray-500/10'
              } blur-xl transform translate-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300`}></div>
            </motion.div>
          ))}
        </div>

        {/* 3D Selected Preset Display */}
        {selectedPreset && (
          <motion.div 
            className="mt-8 relative backdrop-blur-sm bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5"></div>
            
            <div className="relative z-10">
              <motion.div 
                className="flex items-center mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <motion.span 
                  className="text-green-600 mr-3 text-2xl"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  ✅
                </motion.span>
                <div>
                  <span className="font-bold text-green-800 text-lg">
                    Selected: {selectedPreset.preview} {selectedPreset.name}
                  </span>
                  <p className="text-sm text-green-600 mt-1">{selectedPreset.description}</p>
                </div>
              </motion.div>
              
              <motion.div
                className="bg-white/80 rounded-xl p-4 border border-green-200/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <p className="text-sm text-green-700 leading-relaxed">
                  <strong className="text-green-800">Full Prompt:</strong> {selectedPreset.prompt}
                </p>
              </motion.div>
            </div>

            {/* Animated Border */}
            <motion.div 
              className="absolute inset-0 rounded-2xl border-2 border-green-400/30"
              animate={{
                borderColor: ['rgba(34, 197, 94, 0.3)', 'rgba(59, 130, 246, 0.3)', 'rgba(34, 197, 94, 0.3)']
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PresetLibrary;