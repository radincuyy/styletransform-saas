import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Sparkles, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
      // Force logout even if there's an error
      navigate('/');
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500" />
              <span className="text-lg sm:text-xl font-bold text-gray-900">StyleTransform</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-500 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/text-to-image" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-500 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Text to Image</span>
                </Link>
                <Link 
                  to="/image-to-image" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-500 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Image Editor</span>
                </Link>
                {/* Show monitoring link for admin users */}
                {currentUser && (
                  currentUser.email?.includes('admin') || 
                  currentUser.uid === 'admin' ||
                  currentUser.email === 'admin@styletransform.com' ||
                  currentUser.email === 'radincuyy@gmail.com' ||
                  // TEMPORARY: Show monitoring for all users in development
                  process.env.NODE_ENV === 'development'
                ) && (
                  <Link 
                    to="/monitoring" 
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-500 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Monitoring</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-500 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-primary-500 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden mt-5">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-primary-500 focus:outline-none focus:text-primary-500"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-4 pt-4 pb-6 space-y-2 bg-white border-t border-gray-200 shadow-lg">
              {currentUser ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center space-x-3 text-gray-700 hover:text-primary-500 hover:bg-gray-50 px-4 py-3 rounded-lg text-base font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    to="/text-to-image" 
                    className="flex items-center space-x-3 text-gray-700 hover:text-primary-500 hover:bg-gray-50 px-4 py-3 rounded-lg text-base font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Text to Image</span>
                  </Link>
                  <Link 
                    to="/image-to-image" 
                    className="flex items-center space-x-3 text-gray-700 hover:text-primary-500 hover:bg-gray-50 px-4 py-3 rounded-lg text-base font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Image Editor</span>
                  </Link>
                  {/* Show monitoring link for admin users */}
                  {currentUser && (
                    currentUser.email?.includes('admin') || 
                    currentUser.uid === 'admin' ||
                    currentUser.email === 'admin@styletransform.com' ||
                    currentUser.email === 'radincuyy@gmail.com' ||
                    // TEMPORARY: Show monitoring for all users in development
                    process.env.NODE_ENV === 'development'
                  ) && (
                    <Link 
                      to="/monitoring" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-primary-500 hover:bg-gray-50 px-4 py-3 rounded-lg text-base font-medium transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Monitoring</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 text-gray-700 hover:text-red-500 hover:bg-red-50 px-4 py-3 rounded-lg text-base font-medium transition-colors w-full text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block text-gray-700 hover:text-primary-500 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="block bg-primary-500 text-white hover:bg-primary-600 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;