// Google Analytics 4 Integration
class Analytics {
  constructor() {
    this.isInitialized = false;
    this.events = [];
    this.userId = null;
  }

  // Initialize Google Analytics
  init(measurementId) {
    if (typeof window === 'undefined' || this.isInitialized) return;

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href,
    });

    this.isInitialized = true;
    console.log('Analytics initialized');

    // Send queued events
    this.flushEvents();
  }

  // Set user ID for tracking
  setUserId(userId) {
    this.userId = userId;
    if (this.isInitialized && window.gtag) {
      window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID, {
        user_id: userId
      });
    }
  }

  // Track page views
  trackPageView(path, title) {
    const event = {
      type: 'page_view',
      page_path: path,
      page_title: title,
      timestamp: new Date().toISOString()
    };

    if (this.isInitialized && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title
      });
    } else {
      this.events.push(event);
    }

    // Also track internally
    this.trackEvent('page_view', { path, title });
  }

  // Track custom events
  trackEvent(eventName, parameters = {}) {
    const event = {
      type: 'custom_event',
      event_name: eventName,
      parameters: {
        ...parameters,
        user_id: this.userId,
        timestamp: new Date().toISOString()
      }
    };

    if (this.isInitialized && window.gtag) {
      window.gtag('event', eventName, parameters);
    } else {
      this.events.push(event);
    }

    // Store locally for internal analytics
    this.storeEvent(event);
  }

  // Track user registration
  trackSignUp(method = 'email') {
    this.trackEvent('sign_up', {
      method: method,
      event_category: 'engagement',
      event_label: 'user_registration'
    });
  }

  // Track user login
  trackLogin(method = 'email') {
    this.trackEvent('login', {
      method: method,
      event_category: 'engagement',
      event_label: 'user_login'
    });
  }

  // Track image generation
  trackGeneration(preset, prompt, success = true) {
    this.trackEvent('generate_image', {
      preset: preset,
      prompt_length: prompt ? prompt.length : 0,
      success: success,
      event_category: 'engagement',
      event_label: 'image_generation'
    });
  }

  // Track payment events
  trackPurchase(value, currency = 'USD', items = []) {
    this.trackEvent('purchase', {
      transaction_id: Date.now().toString(),
      value: value,
      currency: currency,
      items: items,
      event_category: 'ecommerce',
      event_label: 'subscription_purchase'
    });
  }

  // Track user engagement
  trackEngagement(action, category = 'engagement') {
    this.trackEvent('engagement', {
      engagement_action: action,
      event_category: category,
      event_label: action
    });
  }

  // Track errors
  trackError(error, context = '') {
    this.trackEvent('exception', {
      description: error.message || error,
      fatal: false,
      context: context,
      event_category: 'error',
      event_label: 'application_error'
    });
  }

  // Track performance metrics
  trackTiming(name, value, category = 'performance') {
    this.trackEvent('timing_complete', {
      name: name,
      value: value,
      event_category: category,
      event_label: name
    });
  }

  // Store events locally
  storeEvent(event) {
    try {
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      events.push(event);
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
    }
  }

  // Get stored events
  getStoredEvents() {
    try {
      return JSON.parse(localStorage.getItem('analytics_events') || '[]');
    } catch (error) {
      console.warn('Failed to retrieve analytics events:', error);
      return [];
    }
  }

  // Flush queued events
  flushEvents() {
    if (!this.isInitialized || !window.gtag) return;

    this.events.forEach(event => {
      if (event.type === 'page_view') {
        window.gtag('event', 'page_view', {
          page_path: event.page_path,
          page_title: event.page_title
        });
      } else if (event.type === 'custom_event') {
        window.gtag('event', event.event_name, event.parameters);
      }
    });

    this.events = [];
  }

  // Get analytics summary
  getAnalyticsSummary() {
    const events = this.getStoredEvents();
    const summary = {
      totalEvents: events.length,
      eventTypes: {},
      recentEvents: events.slice(-10),
      userEngagement: {
        pageViews: 0,
        generations: 0,
        logins: 0,
        signups: 0
      }
    };

    events.forEach(event => {
      const eventName = event.event_name || event.type;
      summary.eventTypes[eventName] = (summary.eventTypes[eventName] || 0) + 1;

      // Count specific engagement metrics
      switch (eventName) {
        case 'page_view':
          summary.userEngagement.pageViews++;
          break;
        case 'generate_image':
          summary.userEngagement.generations++;
          break;
        case 'login':
          summary.userEngagement.logins++;
          break;
        case 'sign_up':
          summary.userEngagement.signups++;
          break;
        default:
          // Other events are counted in eventTypes but not in specific metrics
          break;
      }
    });

    return summary;
  }

  // Clear stored events
  clearEvents() {
    localStorage.removeItem('analytics_events');
  }
}

// Create singleton instance
const analytics = new Analytics();

// Initialize if measurement ID is available
if (process.env.REACT_APP_GA_MEASUREMENT_ID) {
  analytics.init(process.env.REACT_APP_GA_MEASUREMENT_ID);
}

export default analytics;