const { db } = require('../config/firebase');
const { logToFile } = require('../middleware/monitoring');

class Analytics {
  constructor() {
    this.events = [];
    this.batchSize = 10;
    this.flushInterval = 30000; // 30 seconds
    
    // Auto-flush events periodically
    setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  // Track user events
  trackEvent(eventName, userId, data = {}) {
    const event = {
      eventName,
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString(),
      data,
      sessionId: this.generateSessionId(userId),
      ip: data.ip || 'unknown'
    };

    this.events.push(event);
    
    // Log to console for debugging
    console.log(`📊 Analytics: ${eventName} - User: ${userId || 'anonymous'}`);
    
    // Log to file immediately for important events
    if (['user_registered', 'payment_completed', 'generation_failed'].includes(eventName)) {
      logToFile('analytics', event);
    }

    // Flush if batch is full
    if (this.events.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  // Flush events to database and logs
  async flushEvents() {
    if (this.events.length === 0) return;

    const eventsToFlush = [...this.events];
    this.events = [];

    try {
      // Save to Firestore if available
      if (db) {
        const batch = db.batch();
        eventsToFlush.forEach(event => {
          const docRef = db.collection('analytics').doc();
          // Sanitize event data to remove undefined values
          const sanitizedEvent = this.sanitizeEventData(event);
          batch.set(docRef, sanitizedEvent);
        });
        await batch.commit();
      }

      // Always log to file as backup
      eventsToFlush.forEach(event => {
        logToFile('analytics', event);
      });

      console.log(`📊 Flushed ${eventsToFlush.length} analytics events`);
    } catch (error) {
      console.error('❌ Failed to flush analytics events:', error);
      // Put events back if failed
      this.events.unshift(...eventsToFlush);
    }
  }

  // Sanitize event data to remove undefined values for Firestore
  sanitizeEventData(event) {
    const sanitized = {};
    
    Object.keys(event).forEach(key => {
      const value = event[key];
      
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          // Recursively sanitize nested objects
          const nestedSanitized = {};
          Object.keys(value).forEach(nestedKey => {
            if (value[nestedKey] !== undefined && value[nestedKey] !== null) {
              nestedSanitized[nestedKey] = value[nestedKey];
            }
          });
          
          // Only add if the nested object has properties
          if (Object.keys(nestedSanitized).length > 0) {
            sanitized[key] = nestedSanitized;
          }
        } else {
          sanitized[key] = value;
        }
      }
    });
    
    return sanitized;
  }

  // Generate session ID
  generateSessionId(userId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${userId || 'anon'}_${timestamp}_${random}`;
  }

  // Track specific events
  trackUserRegistration(userId, method = 'email') {
    this.trackEvent('user_registered', userId, { method });
  }

  trackUserLogin(userId, method = 'email') {
    this.trackEvent('user_login', userId, { method });
  }

  trackImageUpload(userId, imageSize, imageType) {
    this.trackEvent('image_uploaded', userId, { imageSize, imageType });
  }

  trackGeneration(userId, preset, prompt, success = true, type = 'general') {
    this.trackEvent('generation_requested', userId, { 
      preset, 
      prompt: prompt?.substring(0, 100), // Limit prompt length
      success,
      type
    });
  }

  trackPayment(userId, amount, currency, success = true) {
    this.trackEvent('payment_attempted', userId, { amount, currency, success });
  }

  trackError(userId, errorType, errorMessage, endpoint) {
    this.trackEvent('error_occurred', userId, { 
      errorType, 
      errorMessage: errorMessage?.substring(0, 200),
      endpoint 
    });
  }

  // Get analytics summary
  async getAnalyticsSummary(days = 7) {
    try {
      if (!db) {
        return { error: 'Database not available' };
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const snapshot = await db.collection('analytics')
        .where('timestamp', '>=', startDate.toISOString())
        .get();

      const events = [];
      snapshot.forEach(doc => {
        events.push(doc.data());
      });

      // Analyze events
      const summary = {
        totalEvents: events.length,
        uniqueUsers: new Set(events.map(e => e.userId)).size,
        eventBreakdown: {},
        dailyStats: {},
        topUsers: {},
        errors: []
      };

      // Count events by type
      events.forEach(event => {
        summary.eventBreakdown[event.eventName] = (summary.eventBreakdown[event.eventName] || 0) + 1;
        
        // Daily stats
        const date = event.timestamp.split('T')[0];
        if (!summary.dailyStats[date]) {
          summary.dailyStats[date] = { events: 0, users: new Set() };
        }
        summary.dailyStats[date].events++;
        summary.dailyStats[date].users.add(event.userId);

        // Top users
        if (event.userId !== 'anonymous') {
          summary.topUsers[event.userId] = (summary.topUsers[event.userId] || 0) + 1;
        }

        // Collect errors
        if (event.eventName === 'error_occurred') {
          summary.errors.push({
            timestamp: event.timestamp,
            userId: event.userId,
            error: event.data.errorMessage,
            endpoint: event.data.endpoint
          });
        }
      });

      // Convert daily users Set to count
      Object.keys(summary.dailyStats).forEach(date => {
        summary.dailyStats[date].users = summary.dailyStats[date].users.size;
      });

      return summary;
    } catch (error) {
      console.error('❌ Failed to get analytics summary:', error);
      return { error: error.message };
    }
  }
}

// Create singleton instance
const analytics = new Analytics();

module.exports = analytics;