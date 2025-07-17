import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { StripeProvider } from './contexts/StripeContext';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { PageLoadingSkeleton } from './components/LoadingSpinner';

// Lazy load pages for better performance
const Landing = React.lazy(() => import('./pages/Landing'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Monitoring = React.lazy(() => import('./pages/Monitoring'));
const TextToImage = React.lazy(() => import('./pages/TextToImage'));
const ImageToImage = React.lazy(() => import('./pages/ImageToImage'));

function App() {
  return (
    <ErrorBoundary>
      <StripeProvider>
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <React.Suspense fallback={<PageLoadingSkeleton />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/monitoring" 
                    element={
                      <ProtectedRoute>
                        <Monitoring />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/text-to-image" 
                    element={
                      <ProtectedRoute>
                        <TextToImage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/image-to-image" 
                    element={
                      <ProtectedRoute>
                        <ImageToImage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/history" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </React.Suspense>
              <Toaster position="top-right" />
            </div>
          </Router>
        </AuthProvider>
      </StripeProvider>
    </ErrorBoundary>
  );
}

export default App;