# Monitoring System Documentation

## Overview

StyleTransform SaaS dilengkapi dengan sistem monitoring komprehensif yang melacak performance, errors, user analytics, dan system health secara real-time.

## Features

### 🔍 **Real-time Monitoring**
- API response times dan status codes
- Memory usage dan system uptime
- Error tracking dan consecutive error detection
- User activity dan engagement metrics

### 📊 **Analytics Tracking**
- User registrations dan logins
- Image uploads dan AI generations
- Payment transactions
- Custom events dengan metadata

### 🚨 **Alert System**
- Automatic threshold-based alerts
- Critical, warning, dan info severity levels
- Real-time notifications untuk system issues
- Configurable alert thresholds

### 📈 **Performance Metrics**
- API call statistics
- Response time monitoring
- Error rate tracking
- User engagement analytics

## Components

### Backend Components

#### 1. **Monitoring Middleware** (`/backend/middleware/monitoring.js`)
```javascript
// Request logging dengan performance tracking
app.use(requestLogger);

// Error logging dengan analytics integration
app.use(errorLogger);
```

#### 2. **Analytics System** (`/backend/utils/analytics.js`)
```javascript
// Track user events
analytics.trackUserRegistration(userId, 'firebase');
analytics.trackGeneration(userId, preset, prompt, success);
analytics.trackPayment(userId, amount, currency, success);
```

#### 3. **Alert System** (`/backend/utils/alertSystem.js`)
```javascript
// Automatic health checks
alertSystem.checkSystemHealth(stats, health);

// Manual alert triggers
alertSystem.triggerAlert({
  type: 'CUSTOM_ALERT',
  severity: 'warning',
  message: 'Custom alert message'
});
```

### Frontend Components

#### 1. **Monitoring Dashboard** (`/frontend/src/components/MonitoringDashboard.js`)
- Real-time system health display
- Performance statistics visualization
- Alert management interface
- Analytics summary dengan charts

#### 2. **Monitoring Page** (`/frontend/src/pages/Monitoring.js`)
- Admin-only access control
- Full monitoring dashboard integration
- Responsive design untuk mobile/desktop

## API Endpoints

### Health Check
```
GET /health
```
Response:
```json
{
  "status": "healthy",
  "uptime": "2h 30m",
  "memory": {
    "used": "150 MB",
    "total": "512 MB"
  },
  "performance": {
    "totalApiCalls": 1250,
    "totalErrors": 5,
    "uniqueUsers": 45
  }
}
```

### Performance Stats
```
GET /api/monitoring/stats
```
Response:
```json
{
  "totalApiCalls": 1250,
  "totalErrors": 5,
  "uniqueUsers": 45,
  "apiCallsBreakdown": {
    "/api/generate_200": { "count": 800, "avgDuration": 2500 },
    "/api/auth/verify_200": { "count": 400, "avgDuration": 150 }
  }
}
```

### Analytics Summary
```
GET /api/monitoring/analytics?days=7
```
Response:
```json
{
  "totalEvents": 2500,
  "uniqueUsers": 45,
  "eventBreakdown": {
    "user_registered": 12,
    "generation_requested": 800,
    "payment_completed": 5
  },
  "dailyStats": {
    "2025-01-15": { "events": 350, "users": 25 },
    "2025-01-14": { "events": 280, "users": 18 }
  }
}
```

### System Alerts
```
GET /api/monitoring/alerts?limit=20
```
Response:
```json
{
  "alerts": [
    {
      "type": "HIGH_ERROR_RATE",
      "severity": "critical",
      "message": "High error rate detected: 15.2%",
      "timestamp": "2025-01-16T10:30:00Z"
    }
  ],
  "summary": {
    "total": 3,
    "critical": 1,
    "warning": 2,
    "info": 0
  }
}
```

## Configuration

### Alert Thresholds
```javascript
// Default thresholds (dapat dikustomisasi)
const thresholds = {
  errorRate: 0.1,        // 10% error rate
  responseTime: 5000,    // 5 seconds
  memoryUsage: 0.8,      // 80% memory usage
  consecutiveErrors: 5   // 5 consecutive errors
};

// Update thresholds
alertSystem.updateThresholds({
  errorRate: 0.05,  // 5% error rate
  memoryUsage: 0.9  // 90% memory usage
});
```

### Analytics Events
```javascript
// Built-in events
- user_registered
- user_login
- image_uploaded
- generation_requested
- payment_attempted
- error_occurred

// Custom events
analytics.trackEvent('custom_event', userId, {
  customData: 'value',
  metadata: { key: 'value' }
});
```

## Access Control

### Admin Access
Monitoring dashboard hanya dapat diakses oleh admin users:
```javascript
// Admin detection logic
const isAdmin = user && (
  user.email === 'admin@styletransform.com' || 
  user.uid === 'admin' ||
  user.email?.includes('admin')
);
```

### URL Access
- **Public**: `/health` - Basic health check
- **Admin Only**: `/monitoring` - Full monitoring dashboard
- **API**: `/api/monitoring/*` - Monitoring API endpoints

## Log Files

### File Structure
```
backend/logs/
├── requests-2025-01-16.log    # Request logs
├── errors-2025-01-16.log      # Error logs
├── analytics-2025-01-16.log   # Analytics events
└── alerts-2025-01-16.log      # System alerts
```

### Log Rotation
- Daily log files dengan timestamp
- Automatic cleanup untuk old logs
- JSON format untuk easy parsing

## Monitoring Best Practices

### 1. **Regular Health Checks**
- Monitor `/health` endpoint setiap 1 menit
- Set up external uptime monitoring (UptimeRobot, Pingdom)
- Configure alerts untuk downtime

### 2. **Performance Monitoring**
- Track API response times
- Monitor memory usage trends
- Set alerts untuk performance degradation

### 3. **Error Tracking**
- Monitor error rates dan patterns
- Set up alerts untuk consecutive errors
- Regular review error logs

### 4. **User Analytics**
- Track user engagement metrics
- Monitor conversion rates
- Analyze user behavior patterns

### 5. **Security Monitoring**
- Monitor failed authentication attempts
- Track suspicious user activities
- Set alerts untuk security incidents

## Integration dengan External Services

### Recommended Tools
- **Error Tracking**: Sentry
- **Uptime Monitoring**: UptimeRobot
- **Performance**: New Relic, DataDog
- **Notifications**: Slack, Email

### Webhook Integration
```javascript
// Example: Send alerts to Slack
const sendSlackAlert = async (alert) => {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 ${alert.severity.toUpperCase()}: ${alert.message}`,
      channel: '#alerts'
    })
  });
};
```

## Troubleshooting

### Common Issues

1. **Monitoring Dashboard tidak load**
   - Check admin permissions
   - Verify API endpoints accessible
   - Check browser console untuk errors

2. **Analytics data kosong**
   - Verify database connection
   - Check analytics tracking implementation
   - Ensure events properly flushed

3. **Alerts tidak trigger**
   - Check alert thresholds
   - Verify health check interval
   - Review alert system logs

### Debug Commands
```bash
# Check logs
tail -f backend/logs/errors-$(date +%Y-%m-%d).log

# Test health endpoint
curl http://localhost:5000/health

# Test monitoring API
curl http://localhost:5000/api/monitoring/stats
```

## Performance Impact

### Resource Usage
- **Memory**: ~10-20MB additional untuk monitoring
- **CPU**: <1% overhead untuk tracking
- **Storage**: ~1-5MB per day untuk logs
- **Network**: Minimal impact pada API responses

### Optimization Tips
- Batch analytics events (default: 10 events)
- Limit log retention (default: 7 days)
- Use sampling untuk high-traffic endpoints
- Compress old log files

## Future Enhancements

### Planned Features
- [ ] Real-time dashboard updates dengan WebSocket
- [ ] Custom dashboard widgets
- [ ] Advanced analytics dengan charts
- [ ] Machine learning untuk anomaly detection
- [ ] Integration dengan cloud monitoring services
- [ ] Mobile app untuk monitoring alerts

### Custom Metrics
```javascript
// Example: Track custom business metrics
analytics.trackEvent('subscription_conversion', userId, {
  plan: 'premium',
  revenue: 29.99,
  source: 'dashboard'
});
```

## Conclusion

Sistem monitoring StyleTransform SaaS memberikan visibility lengkap terhadap:
- System health dan performance
- User behavior dan engagement
- Error patterns dan issues
- Business metrics dan analytics

Dengan monitoring yang komprehensif ini, Anda dapat:
- Detect issues sebelum mempengaruhi users
- Optimize performance berdasarkan data
- Make informed decisions untuk product development
- Ensure high availability dan reliability