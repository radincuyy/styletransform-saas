// Application constants

export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    generations: 5,
    features: [
      '5 style transformations',
      'Basic image quality',
      'Standard processing time',
      'Email support'
    ]
  },
  PREMIUM: {
    name: 'Premium',
    price: 9.99,
    generations: 100,
    features: [
      '100 style transformations',
      'High-quality images',
      'Priority processing',
      'Advanced AI models',
      'Priority support',
      'Commercial usage rights'
    ]
  }
};

export const IMAGE_CONSTRAINTS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_DIMENSION: 2048,
  MIN_DIMENSION: 256
};

export const API_ENDPOINTS = {
  AUTH: {
    VERIFY: '/api/auth/verify',
    PROFILE: '/api/auth/profile'
  },
  GENERATE: {
    CREATE: '/api/generate',
    HISTORY: '/api/generate/history'
  },
  USER: {
    STATS: '/api/user/stats',
    USAGE: '/api/user/usage'
  },
  PAYMENT: {
    CHECKOUT: '/api/payment/create-checkout-session',
    SUBSCRIPTION: '/api/payment/subscription',
    CANCEL: '/api/payment/cancel-subscription'
  }
};

export const STYLE_CATEGORIES = [
  'All',
  'Casual',
  'Professional',
  'Vintage',
  'Urban',
  'Formal',
  'Boho',
  'Athletic',
  'Artistic'
];

export const GENERATION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  UNPAID: 'unpaid'
};