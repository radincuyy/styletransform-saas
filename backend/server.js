const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { requestLogger, errorLogger, performanceMonitor, healthCheck } = require('./middleware/monitoring');
const analytics = require('./utils/analytics');
const alertSystem = require('./utils/alertSystem');
// Try multiple paths for .env file
const path = require('path');
const fs = require('fs');

// Check different possible locations for .env file
const envPaths = [
  path.join(__dirname, '../.env'),
  path.join(__dirname, '.env'),
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), '../.env')
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    console.log(`📁 Loading .env from: ${envPath}`);
    require('dotenv').config({ path: envPath });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('⚠️  No .env file found in any of the expected locations');
  console.warn('📍 Searched paths:', envPaths);
}

// Debug: Log environment variables to verify they're loaded
console.log('🔍 Environment Variables Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REPLICATE_API_TOKEN:', process.env.REPLICATE_API_TOKEN ? `Configured ✅ (${process.env.REPLICATE_API_TOKEN.substring(0, 10)}...)` : 'Missing ❌');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Configured ✅' : 'Missing ❌');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'Configured ✅' : 'Missing ❌');

// Import and check database connection
const { db } = require('./config/firebase');
console.log('📊 Database Status:', db ? 'Connected ✅' : 'Not Connected ❌');
if (!db) {
  console.log('🔧 To enable database:');
  console.log('   1. Visit: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=stylist-727b5');
  console.log('   2. Click "ENABLE" to activate Firestore API');
  console.log('   3. Create Firestore database in Firebase Console');
  console.log('   4. Restart this server');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(compression());

// Trust proxy - needed for rate limiting behind proxies
app.set('trust proxy', 1);

// Rate limiting - More generous for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 requests for dev, 100 for prod
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  // Skip rate limiting for monitoring endpoints in development
  skip: (req) => {
    if (process.env.NODE_ENV !== 'production' && req.url.startsWith('/api/monitoring')) {
      return true;
    }
    return false;
  }
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true
}));

// Monitoring middleware
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/generate', require('./routes/generate'));
app.use('/api/user', require('./routes/user'));
app.use('/api/payment', require('./routes/payment'));

// Monitoring endpoints
app.get('/health', (req, res) => {
  const health = healthCheck.getSystemHealth();
  res.status(200).json(health);
});

app.get('/api/monitoring/stats', (req, res) => {
  const stats = performanceMonitor.getStats();
  res.status(200).json(stats);
});

app.get('/api/monitoring/analytics', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const summary = await analytics.getAnalyticsSummary(days);
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

app.get('/api/monitoring/alerts', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const alerts = alertSystem.getRecentAlerts(limit);
    const summary = alertSystem.getAlertSummary();
    
    res.status(200).json({
      alerts,
      summary
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get alerts' });
  }
});

// Periodic health check and alert generation (less frequent)
setInterval(() => {
  try {
    const stats = performanceMonitor.getStats();
    const health = healthCheck.getSystemHealth();
    
    // Only check system health if there are actual API calls
    if (stats.totalApiCalls > 0) {
      alertSystem.checkSystemHealth(stats, health);
      
      // Record success/error for alert system based on error rate
      const errorRate = stats.totalErrors / stats.totalApiCalls;
      if (errorRate > 0.1) { // Only record error if error rate > 10%
        alertSystem.recordError();
      } else {
        alertSystem.recordSuccess();
      }
    }
  } catch (error) {
    console.error('Health check error:', error);
  }
}, 5 * 60 * 1000); // Check every 5 minutes instead of 1 minute

// Error handling middleware
app.use(errorLogger);
app.use((err, req, res, next) => {
  // Track error in analytics
  analytics.trackError(req.user?.uid, err.name, err.message, req.originalUrl);
  
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Handle server startup errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.log('💡 Try using a different port or stop the process using this port');
    process.exit(1);
  } else {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});