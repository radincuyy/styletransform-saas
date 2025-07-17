import toast from 'react-hot-toast';

// Centralized error handler for the application
export const handleApiError = (error, customMessage = null) => {
  console.error('API Error:', error);

  // Network errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
    toast.error(customMessage || 'Unable to connect to server. Please check your connection.');
    return;
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED') {
    toast.error(customMessage || 'Request timeout. Please try again.');
    return;
  }

  // HTTP status errors
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.error;

    switch (status) {
      case 400:
        toast.error(message || customMessage || 'Invalid request. Please check your input.');
        break;
      case 401:
        toast.error(message || customMessage || 'Session expired. Please log in again.');
        break;
      case 403:
        toast.error(message || customMessage || 'Access denied. You may need to upgrade your plan.');
        break;
      case 404:
        toast.error(message || customMessage || 'Resource not found.');
        break;
      case 429:
        toast.error(message || customMessage || 'Too many requests. Please wait and try again.');
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        toast.error(message || customMessage || 'Server error. Please try again later.');
        break;
      default:
        toast.error(message || customMessage || 'An unexpected error occurred.');
    }
  } else {
    // Generic error
    toast.error(customMessage || 'An unexpected error occurred. Please try again.');
  }
};

// Retry mechanism for failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry for certain error types
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        console.log(`Request failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
  
  throw lastError;
};

// Check if error is retryable
export const isRetryableError = (error) => {
  if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return true;
  }
  
  if (error.response?.status >= 500) {
    return true;
  }
  
  return false;
};