const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log request
  const requestLog = {
    timestamp,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user?.uid || 'anonymous'
  };

  // Override res.end to capture response data
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    
    const responseLog = {
      ...requestLog,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || 0
    };

    // Record performance metrics
    performanceMonitor.recordApiCall(req.url, duration, res.statusCode);
    performanceMonitor.recordUser(req.user?.uid);

    // Record performance metrics for errors
    if (res.statusCode >= 400) {
      performanceMonitor.recordError(res.statusCode, req.url);
    }

    // Log to console with colors
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : res.statusCode >= 300 ? '\x1b[33m' : '\x1b[32m';
    console.log(`${statusColor}${req.method} ${req.url} ${res.statusCode} - ${duration}ms\x1b[0m`);

    // Log to file
    logToFile('requests', responseLog);

    originalEnd.apply(this, args);
  };

  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.uid || 'anonymous',
      body: req.body,
      params: req.params,
      query: req.query
    }
  };

  // Log error to console
  console.error(`🚨 ERROR: ${err.message}`);
  console.error(`📍 URL: ${req.method} ${req.url}`);
  console.error(`👤 User: ${req.user?.uid || 'anonymous'}`);

  // Log to file
  logToFile('errors', errorLog);

  next(err);
};

// Performance monitoring
const performanceMonitor = {
  apiCalls: new Map(),
  errors: new Map(),
  users: new Set(),
  
  recordApiCall(endpoint, duration, statusCode) {
    const key = `${endpoint}_${statusCode}`;
    const current = this.apiCalls.get(key) || { count: 0, totalDuration: 0, avgDuration: 0 };
    
    current.count++;
    current.totalDuration += duration;
    current.avgDuration = Math.round(current.totalDuration / current.count);
    
    this.apiCalls.set(key, current);
  },

  recordError(error, endpoint) {
    const key = `${endpoint}_${error}`;
    const current = this.errors.get(key) || 0;
    this.errors.set(key, current + 1);
  },

  recordUser(userId) {
    if (userId && userId !== 'anonymous') {
      this.users.add(userId);
    }
  },

  getStats() {
    return {
      totalApiCalls: Array.from(this.apiCalls.values()).reduce((sum, stat) => sum + stat.count, 0),
      totalErrors: Array.from(this.errors.values()).reduce((sum, count) => sum + count, 0),
      uniqueUsers: this.users.size,
      apiCallsBreakdown: Object.fromEntries(this.apiCalls),
      errorsBreakdown: Object.fromEntries(this.errors),
      timestamp: new Date().toISOString()
    };
  },

  reset() {
    this.apiCalls.clear();
    this.errors.clear();
    this.users.clear();
  }
};

// Log to file helper
function logToFile(type, data) {
  const date = new Date().toISOString().split('T')[0];
  const filename = path.join(logsDir, `${type}-${date}.log`);
  
  const logEntry = JSON.stringify(data) + '\n';
  
  fs.appendFile(filename, logEntry, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
}

// System health check
const healthCheck = {
  getSystemHealth() {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
        external: Math.round(memUsage.external / 1024 / 1024) + ' MB'
      },
      performance: performanceMonitor.getStats()
    };
  }
};

module.exports = {
  requestLogger,
  errorLogger,
  performanceMonitor,
  healthCheck,
  logToFile
};