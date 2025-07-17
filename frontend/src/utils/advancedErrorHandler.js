import toast from 'react-hot-toast';
import analytics from './analytics';

// Error types
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  AUTHENTICATION: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  CLIENT: 'CLIENT_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Error severity levels
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

class AdvancedErrorHandler {
  constructor() {
    this.errorQueue = [];
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    this.errorCallbacks = new Map();
  }

  // Main error handling method
  handleError(error, context = {}) {
    const errorInfo = this.analyzeError(error, context);
    
    // Log error
    this.logError(errorInfo);
    
    // Track in analytics
    analytics.trackError(error, context.component || 'unknown');
    
    // Show user-friendly message
    this.showUserMessage(errorInfo);
    
    // Execute callbacks
    this.executeCallbacks(errorInfo);
    
    // Auto-retry if applicable
    if (errorInfo.canRetry) {
      this.scheduleRetry(errorInfo);
    }
    
    return errorInfo;
  }

  // Analyze error to determine type and severity
  analyzeError(error, context) {
    let errorType = ErrorTypes.UNKNOWN;
    let severity = ErrorSeverity.MEDIUM;
    let canRetry = false;
    let userMessage = 'An unexpected error occurred';
    let technicalMessage = error.message || 'Unknown error';

    // Network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      errorType = ErrorTypes.NETWORK;
      severity = ErrorSeverity.HIGH;
      canRetry = true;
      userMessage = 'Unable to connect to server. Please check your internet connection.';
    }
    
    // HTTP errors
    else if (error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        errorType = ErrorTypes.AUTHENTICATION;
        severity = ErrorSeverity.HIGH;
        canRetry = false;
        userMessage = 'Your session has expired. Please log in again.';
      }
      else if (status === 403) {
        errorType = ErrorTypes.AUTHENTICATION;
        severity = ErrorSeverity.MEDIUM;
        canRetry = false;
        userMessage = 'You don\'t have permission to perform this action.';
      }
      else if (status === 404) {
        errorType = ErrorTypes.CLIENT;
        severity = ErrorSeverity.LOW;
        canRetry = false;
        userMessage = 'The requested resource was not found.';
      }
      else if (status === 422) {
        errorType = ErrorTypes.VALIDATION;
        severity = ErrorSeverity.LOW;
        canRetry = false;
        userMessage = error.response.data?.message || 'Please check your input and try again.';
      }
      else if (status === 429) {
        errorType = ErrorTypes.RATE_LIMIT;
        severity = ErrorSeverity.MEDIUM;
        canRetry = true;
        userMessage = 'Too many requests. Please wait a moment and try again.';
      }
      else if (status >= 500) {
        errorType = ErrorTypes.SERVER;
        severity = ErrorSeverity.HIGH;
        canRetry = true;
        userMessage = 'Server error. We\'re working to fix this issue.';
      }
    }
    
    // Timeout errors
    else if (error.code === 'ECONNABORTED') {
      errorType = ErrorTypes.TIMEOUT;
      severity = ErrorSeverity.MEDIUM;
      canRetry = true;
      userMessage = 'Request timed out. Please try again.';
    }
    
    // JavaScript errors
    else if (error instanceof TypeError) {
      errorType = ErrorTypes.CLIENT;
      severity = ErrorSeverity.HIGH;
      canRetry = false;
      userMessage = 'A technical error occurred. Please refresh the page.';
    }

    return {
      originalError: error,
      type: errorType,
      severity: severity,
      canRetry: canRetry,
      userMessage: userMessage,
      technicalMessage: technicalMessage,
      context: context,
      timestamp: new Date().toISOString(),
      id: this.generateErrorId()
    };
  }

  // Log error with appropriate level
  logError(errorInfo) {
    const logData = {
      id: errorInfo.id,
      type: errorInfo.type,
      severity: errorInfo.severity,
      message: errorInfo.technicalMessage,
      context: errorInfo.context,
      timestamp: errorInfo.timestamp,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Console logging with appropriate level
    switch (errorInfo.severity) {
      case ErrorSeverity.CRITICAL:
        console.error('🔥 CRITICAL ERROR:', logData);
        break;
      case ErrorSeverity.HIGH:
        console.error('❌ HIGH SEVERITY ERROR:', logData);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('⚠️ MEDIUM SEVERITY ERROR:', logData);
        break;
      case ErrorSeverity.LOW:
        console.info('ℹ️ LOW SEVERITY ERROR:', logData);
        break;
      default:
        console.log('📝 UNKNOWN SEVERITY ERROR:', logData);
        break;
    }

    // Store in local storage for debugging
    this.storeErrorLocally(logData);
  }

  // Show user-friendly message
  showUserMessage(errorInfo) {
    const toastOptions = {
      duration: this.getToastDuration(errorInfo.severity),
      position: 'top-right'
    };

    switch (errorInfo.severity) {
      case ErrorSeverity.CRITICAL:
        toast.error(errorInfo.userMessage, { ...toastOptions, duration: 8000 });
        break;
      case ErrorSeverity.HIGH:
        toast.error(errorInfo.userMessage, { ...toastOptions, duration: 6000 });
        break;
      case ErrorSeverity.MEDIUM:
        toast.error(errorInfo.userMessage, toastOptions);
        break;
      case ErrorSeverity.LOW:
        toast(errorInfo.userMessage, { ...toastOptions, icon: 'ℹ️' });
        break;
      default:
        toast.error(errorInfo.userMessage, toastOptions);
        break;
    }
  }

  // Schedule retry for retryable errors
  scheduleRetry(errorInfo) {
    const retryKey = this.getRetryKey(errorInfo);
    const currentAttempts = this.retryAttempts.get(retryKey) || 0;

    if (currentAttempts < this.maxRetries) {
      const delay = this.retryDelay * Math.pow(2, currentAttempts); // Exponential backoff
      
      setTimeout(() => {
        this.retryAttempts.set(retryKey, currentAttempts + 1);
        
        // Execute retry callback if available
        const retryCallback = this.errorCallbacks.get('retry');
        if (retryCallback) {
          retryCallback(errorInfo);
        }
      }, delay);

      toast.loading(`Retrying... (${currentAttempts + 1}/${this.maxRetries})`, {
        duration: delay,
        id: `retry-${errorInfo.id}`
      });
    } else {
      // Max retries reached
      this.retryAttempts.delete(retryKey);
      toast.error('Maximum retry attempts reached. Please try again later.', {
        duration: 5000
      });
    }
  }

  // Register error callbacks
  onError(type, callback) {
    this.errorCallbacks.set(type, callback);
  }

  // Execute registered callbacks
  executeCallbacks(errorInfo) {
    const callback = this.errorCallbacks.get(errorInfo.type);
    if (callback) {
      try {
        callback(errorInfo);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    }
  }

  // Utility methods
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getRetryKey(errorInfo) {
    return `${errorInfo.context.component || 'unknown'}_${errorInfo.type}`;
  }

  getToastDuration(severity) {
    switch (severity) {
      case ErrorSeverity.CRITICAL: return 8000;
      case ErrorSeverity.HIGH: return 6000;
      case ErrorSeverity.MEDIUM: return 4000;
      case ErrorSeverity.LOW: return 3000;
      default: return 4000;
    }
  }

  storeErrorLocally(errorData) {
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push(errorData);
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('app_errors', JSON.stringify(errors));
    } catch (error) {
      console.warn('Failed to store error locally:', error);
    }
  }

  // Get stored errors for debugging
  getStoredErrors() {
    try {
      return JSON.parse(localStorage.getItem('app_errors') || '[]');
    } catch (error) {
      console.warn('Failed to retrieve stored errors:', error);
      return [];
    }
  }

  // Clear stored errors
  clearStoredErrors() {
    localStorage.removeItem('app_errors');
  }

  // Get error statistics
  getErrorStats() {
    const errors = this.getStoredErrors();
    const stats = {
      total: errors.length,
      byType: {},
      bySeverity: {},
      recent: errors.slice(-10)
    };

    errors.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }
}

// Create singleton instance
const errorHandler = new AdvancedErrorHandler();

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
  errorHandler.handleError(event.error, {
    component: 'global',
    type: 'unhandled_error',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  errorHandler.handleError(event.reason, {
    component: 'global',
    type: 'unhandled_promise_rejection'
  });
});

export default errorHandler;