import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Sparkles, 
  Crown, 
  History, 
  TrendingUp,
  Image,
  Edit3,
  Download,
  Calendar,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PricingModal from '../components/PricingModal';
import LazyImage from '../components/LazyImage';
import SEOHead from '../components/SEOHead';

function Dashboard() {
  const { currentUser } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [recentGenerations, setRecentGenerations] = useState([]);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        
        // Load user profile and recent generations
        const [userResponse, generationsResponse] = await Promise.all([
          api.get('/user'),
          api.get('/generations')
        ]);

        const userData = userResponse.data.user || {};
        const generations = generationsResponse.data.generations || [];
        
        // Calculate stats from user data and generations
        setUserStats({
          generationsUsed: userData.generationsUsed || 0,
          generationLimit: userData.generationLimit || 5,
          totalGenerations: userData.totalGenerations || generations.length,
          isPremium: userData.isPremium || false,
          subscriptionStatus: userData.subscriptionStatus || 'free'
        });
        
        setRecentGenerations(generations.slice(0, 6));
        
      } catch (error) {
        console.error('Failed to load user data:', error);
        // Set default stats if API fails
        setUserStats({
          generationsUsed: 0,
          generationLimit: 5,
          totalGenerations: 0,
          isPremium: false,
          subscriptionStatus: 'free'
        });
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser]);

  const downloadImage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      window.open(imageUrl, '_blank');
      toast('Image opened in new tab. Right-click to save.', {
        icon: 'ℹ️',
        duration: 4000,
      });
    }
  };

  const handleUpgradeClick = () => {
    setShowPricingModal(true);
  };

  // Debug function to check generations
  const debugGenerations = async () => {
    try {
      console.log('🔍 Debug: Checking generations...');
      
      // Test debug endpoint
      const debugResponse = await api.get('/debug-generations');
      console.log('🔍 Debug endpoint response:', debugResponse.data);
      
      // Test new generations endpoint
      const generationsResponse = await api.get('/generations');
      console.log('🔍 Generations endpoint response:', generationsResponse.data);
      
      // Test old user generations endpoint (should fail)
      try {
        const userGenResponse = await api.get('/user/generations');
        console.log('🔍 User generations response:', userGenResponse.data);
      } catch (userGenError) {
        console.log('❌ User generations endpoint failed (expected):', userGenError.message);
      }
      
      toast.success('Debug info logged to console. Check browser console (F12).');
    } catch (error) {
      console.error('❌ Debug error:', error);
      toast.error('Debug failed. Check console for details.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Dashboard - AI Image Generation"
        description="Your AI image generation dashboard. View your usage statistics, recent generations, and access our AI tools."
        keywords="dashboard, AI image generation, statistics, usage"
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <User className="h-8 w-8 mr-3 text-blue-500" />
                  Welcome back, {currentUser?.displayName || 'User'}!
                </h1>
                <p className="text-gray-600 mt-2">
                  Your AI-powered image generation dashboard
                </p>
              </div>
              {userStats && !userStats.isPremium && (
                <button
                  onClick={handleUpgradeClick}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 flex items-center"
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Upgrade to Premium
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">
                {userStats?.generationsUsed || 0}
              </div>
              <div className="text-gray-600 text-sm">Generations Used</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">
                {Math.max(0, (userStats?.generationLimit || 5) - (userStats?.generationsUsed || 0))}
              </div>
              <div className="text-gray-600 text-sm">Remaining</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-500 mb-2">
                {userStats?.totalGenerations || 0}
              </div>
              <div className="text-gray-600 text-sm">Total Created</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className={`text-3xl font-bold mb-2 ${userStats?.isPremium ? 'text-yellow-500' : 'text-gray-500'}`}>
                {userStats?.isPremium ? (
                  <Crown className="h-8 w-8 mx-auto" />
                ) : (
                  <User className="h-8 w-8 mx-auto" />
                )}
              </div>
              <div className="text-gray-600 text-sm">
                {userStats?.isPremium ? 'Premium' : 'Free'} Plan
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Link
              to="/text-to-image"
              className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl p-8 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center mb-4">
                <Edit3 className="h-8 w-8 mr-3" />
                <h3 className="text-2xl font-bold">Text to Image</h3>
              </div>
              <p className="text-blue-100 mb-4">
                Generate stunning images from text descriptions. Perfect for character references and creative concepts.
              </p>
              <div className="flex items-center text-blue-200">
                <Sparkles className="h-5 w-5 mr-2" />
                <span>Create from imagination</span>
              </div>
            </Link>

            <Link
              to="/image-to-image"
              className="bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-xl p-8 hover:from-green-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center mb-4">
                <Image className="h-8 w-8 mr-3" />
                <h3 className="text-2xl font-bold">Image Editor</h3>
              </div>
              <p className="text-green-100 mb-4">
                Transform your existing images with AI. Change styles, colors, backgrounds, and more.
              </p>
              <div className="flex items-center text-green-200">
                <TrendingUp className="h-5 w-5 mr-2" />
                <span>Transform existing images</span>
              </div>
            </Link>
          </div>

          {/* Recent Generations */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <History className="h-6 w-6 mr-3 text-gray-600" />
                Recent Generations
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={debugGenerations}
                  className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600 transition-colors"
                >
                  Debug
                </button>
                <Link
                  to="/history"
                  className="text-blue-500 hover:text-blue-600 font-medium text-sm"
                >
                  View All
                </Link>
              </div>
            </div>

            {recentGenerations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentGenerations.map((generation) => (
                  <div key={generation.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="aspect-square mb-4 relative">
                      <LazyImage
                        src={generation.generatedImageUrl}
                        alt="Generated"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => downloadImage(generation.generatedImageUrl)}
                          className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(generation.timestamp?.toDate ? generation.timestamp.toDate() : generation.timestamp).toLocaleDateString()}
                      </div>
                      
                      {generation.type && (
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            generation.type === 'text-to-image' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {generation.type === 'text-to-image' ? 'Text to Image' : 'Image Editor'}
                          </span>
                        </div>
                      )}
                      
                      {generation.prompt && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {generation.prompt}
                        </p>
                      )}
                      
                      {generation.stylePreset && (
                        <p className="text-xs text-purple-600 font-medium">
                          Style: {generation.stylePreset}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No generations yet</h3>
                <p className="text-gray-500 mb-6">
                  Start creating amazing images with our AI tools
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/text-to-image"
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Try Text to Image
                  </Link>
                  <Link
                    to="/image-to-image"
                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Try Image Editor
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Usage Progress */}
          {userStats && (
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage This Month</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Generations Used</span>
                  <span className="font-medium">
                    {userStats.generationsUsed} / {userStats.generationLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (userStats.generationsUsed / userStats.generationLimit) * 100)}%` 
                    }}
                  ></div>
                </div>
                {userStats.generationsUsed >= userStats.generationLimit && (
                  <div className="text-center mt-4">
                    <p className="text-orange-600 text-sm mb-3">
                      You've reached your monthly limit. Upgrade to continue generating!
                    </p>
                    <button
                      onClick={handleUpgradeClick}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
                    >
                      Upgrade Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pricing Modal */}
          <PricingModal 
            isOpen={showPricingModal} 
            onClose={() => setShowPricingModal(false)} 
          />
        </div>
      </div>
    </>
  );
}

export default Dashboard;