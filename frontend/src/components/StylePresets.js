import React, { useState } from 'react';
import { Sparkles, Download } from 'lucide-react';

function StylePresets({ onPresetSelect = () => { } }) {
  const [selectedPreset, setSelectedPreset] = useState(null);

  const presets = [
    {
      id: 1,
      name: 'Modern Casual',
      image: 'https://via.placeholder.com/200x200/3B82F6/FFFFFF?text=Modern+Casual',
      category: 'Casual',
      description: 'Trendy casual look with modern styling'
    },
    {
      id: 2,
      name: 'Business Professional',
      image: 'https://via.placeholder.com/200x200/1F2937/FFFFFF?text=Business+Pro',
      category: 'Professional',
      description: 'Sharp business attire for professional settings'
    },
    {
      id: 3,
      name: 'Vintage Chic',
      image: 'https://via.placeholder.com/200x200/8B5CF6/FFFFFF?text=Vintage+Chic',
      category: 'Vintage',
      description: 'Classic vintage style with modern twist'
    },
    {
      id: 4,
      name: 'Street Style',
      image: 'https://via.placeholder.com/200x200/EF4444/FFFFFF?text=Street+Style',
      category: 'Urban',
      description: 'Urban street fashion with edgy elements'
    },
    {
      id: 5,
      name: 'Elegant Evening',
      image: 'https://via.placeholder.com/200x200/F59E0B/FFFFFF?text=Elegant+Evening',
      category: 'Formal',
      description: 'Sophisticated evening wear for special occasions'
    },
    {
      id: 6,
      name: 'Bohemian Free',
      image: 'https://via.placeholder.com/200x200/10B981/FFFFFF?text=Bohemian+Free',
      category: 'Boho',
      description: 'Free-spirited bohemian style with flowing elements'
    }
  ];

  const categories = ['All', 'Casual', 'Professional', 'Vintage', 'Urban', 'Formal', 'Boho'];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredPresets = activeCategory === 'All'
    ? presets
    : presets.filter(preset => preset.category === activeCategory);

  const handlePresetClick = (preset) => {
    setSelectedPreset(preset);
    onPresetSelect(preset);
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <Sparkles className="h-5 w-5 mr-2" />
        Style Presets
      </h2>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${activeCategory === category
              ? 'bg-primary-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredPresets.map(preset => (
          <div
            key={preset.id}
            onClick={() => handlePresetClick(preset)}
            className={`cursor-pointer rounded-lg border-2 transition-all hover:shadow-md ${selectedPreset?.id === preset.id
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-primary-300'
              }`}
          >
            <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
              <img
                src={preset.image}
                alt={preset.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm" style={{ display: 'none' }}>
                Style Preview
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-medium text-gray-900 text-sm">
                {preset.name}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {preset.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {selectedPreset && (
        <div className="mt-4 p-3 bg-primary-50 rounded-lg">
          <p className="text-sm text-primary-700">
            Selected: <strong>{selectedPreset.name}</strong>
          </p>
          <p className="text-xs text-primary-600 mt-1">
            This preset will be used as your style reference
          </p>
        </div>
      )}
    </div>
  );
}

export default StylePresets;