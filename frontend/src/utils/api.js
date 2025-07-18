import axios from 'axios';
import { auth } from '../config/firebase';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api' // Use Vercel serverless functions
    : 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds timeout for AI generation
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to get auth token:', error);
      // Continue with request even if token fails
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      toast.error('Unable to connect to server. Please check your connection.');
    } else if (error.response?.status === 401) {
      // Handle unauthorized access
      toast.error('Session expired. Please log in again.');
      auth.signOut();
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      toast.error('Access denied. You may need to upgrade your plan.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.');
    }
    
    return Promise.reject(error);
  }
);



export default api;