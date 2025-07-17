// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  }
  
  return { isValid: true, error: null };
};

// Password validation
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long' };
  }
  
  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { isValid: false, error: 'Password must contain at least one letter and one number' };
  }
  
  return { isValid: true, error: null };
};

// Name validation
export const validateName = (name) => {
  if (!name) {
    return { isValid: false, error: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  
  if (name.length > 50) {
    return { isValid: false, error: 'Name is too long' };
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { isValid: true, error: null };
};

// Text prompt validation
export const validatePrompt = (prompt) => {
  if (!prompt) {
    return { isValid: false, error: 'Prompt is required' };
  }
  
  if (prompt.trim().length < 3) {
    return { isValid: false, error: 'Prompt must be at least 3 characters long' };
  }
  
  if (prompt.length > 500) {
    return { isValid: false, error: 'Prompt is too long (max 500 characters)' };
  }
  
  // Check for potentially harmful content
  const harmfulPatterns = [
    /script/i,
    /<[^>]*>/,
    /javascript:/i,
    /on\w+\s*=/i
  ];
  
  for (const pattern of harmfulPatterns) {
    if (pattern.test(prompt)) {
      return { isValid: false, error: 'Prompt contains invalid characters' };
    }
  }
  
  return { isValid: true, error: null };
};

// File validation
export const validateImageFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'Please select an image file' };
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Please upload a valid image file (JPEG, PNG, WebP)' };
  }
  
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'Image size must be less than 10MB' };
  }
  
  // Check minimum size (to avoid tiny images)
  const minSize = 1024; // 1KB
  if (file.size < minSize) {
    return { isValid: false, error: 'Image file is too small' };
  }
  
  return { isValid: true, error: null };
};

// URL validation
export const validateUrl = (url) => {
  if (!url) {
    return { isValid: false, error: 'URL is required' };
  }
  
  try {
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }
    
    return { isValid: true, error: null };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Rate limiting helper (client-side)
export const createRateLimiter = (maxRequests, windowMs) => {
  const requests = [];
  
  return () => {
    const now = Date.now();
    
    // Remove old requests outside the window
    while (requests.length > 0 && requests[0] <= now - windowMs) {
      requests.shift();
    }
    
    // Check if we've exceeded the limit
    if (requests.length >= maxRequests) {
      return { allowed: false, retryAfter: windowMs - (now - requests[0]) };
    }
    
    // Add current request
    requests.push(now);
    return { allowed: true, retryAfter: 0 };
  };
};

// Form validation helper
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;
  
  for (const [field, rules] of Object.entries(validationRules)) {
    const value = formData[field];
    
    for (const rule of rules) {
      const result = rule(value);
      if (!result.isValid) {
        errors[field] = result.error;
        isValid = false;
        break; // Stop at first error for this field
      }
    }
  }
  
  return { isValid, errors };
};

// Common validation rules
export const validationRules = {
  email: [validateEmail],
  password: [validatePassword],
  name: [validateName],
  prompt: [validatePrompt],
  imageFile: [validateImageFile],
  url: [validateUrl]
};