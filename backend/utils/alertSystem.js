const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Local logToFile function to avoid circular dependency
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

class AlertSystem {
  constructor() {
    this.alerts = [];
    this.thresholds = {
      errorRate: 0.5, // 50% error rate (less sensitive)
      responseTime: 10000, // 10 seconds
      memoryUsage: 0.9, // 90% memory usage
      diskSpace: 0.95, // 95% disk usage
      consecutiveErrors: 10 // 10 consecutive errors
    };
    this.consecutiveErrorCount = 0;
    this.lastErrorTime = null;
  }

  // Check system health and trigger alerts
  checkSystemHealth(stats, health) {
    const alerts = [];

    // Check error rate
    if (stats.totalApiCalls > 0) {
      const errorRate = stats.totalErrors / stats.totalApiCalls;
      if (errorRate > this.thresholds.errorRate) {
        alerts.push({
          type: 'HIGH_ERROR_RATE',
          severity: 'critical',
          message: `High error rate detected: ${(errorRate * 100).toFixed(1)}%`,
          value: errorRate,
          threshold: this.thresholds.errorRate,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Check memory usage
    if (health && health.memory) {
      const memUsed = parseInt(health.memory.used);
      const memTotal = parseInt(health.memory.total);
      const memUsage = memUsed / memTotal;
      
      if (memUsage > this.thresholds.memoryUsage) {
        alerts.push({
          type: 'HIGH_MEMORY_USAGE',
          severity: 'warning',
          message: `High memory usage: ${(memUsage * 100).toFixed(1)}%`,
          value: memUsage,
          threshold: this.thresholds.memoryUsage,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Check consecutive errors
    if (this.consecutiveErrorCount >= this.thresholds.consecutiveErrors) {
      alerts.push({
        type: 'CONSECUTIVE_ERRORS',
        severity: 'critical',
        message: `${this.consecutiveErrorCount} consecutive errors detected`,
        value: this.consecutiveErrorCount,
        threshold: this.thresholds.consecutiveErrors,
        timestamp: new Date().toISOString()
      });
    }

    // Process alerts
    alerts.forEach(alert => this.triggerAlert(alert));

    return alerts;
  }

  // Record error for consecutive error tracking
  recordError() {
    const now = Date.now();
    const timeSinceLastError = this.lastErrorTime ? now - this.lastErrorTime : Infinity;
    
    // Reset counter if more than 5 minutes since last error
    if (timeSinceLastError > 5 * 60 * 1000) {
      this.consecutiveErrorCount = 1;
    } else {
      this.consecutiveErrorCount++;
    }
    
    this.lastErrorTime = now;
  }

  // Reset consecutive error count on successful request
  recordSuccess() {
    this.consecutiveErrorCount = 0;
    this.lastErrorTime = null;
  }

  // Trigger alert
  triggerAlert(alert) {
    // Add to alerts array
    this.alerts.unshift(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }

    // Log alert
    console.error(`🚨 ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
    logToFile('alerts', alert);

    // Send notifications (email, Slack, etc.)
    this.sendNotification(alert);
  }

  // Send notification (placeholder for email/Slack integration)
  sendNotification(alert) {
    // TODO: Implement email/Slack notifications
    if (alert.severity === 'critical') {
      console.error(`🔥 CRITICAL ALERT: ${alert.message}`);
      // Send email/Slack notification here
    }
  }

  // Get recent alerts
  getRecentAlerts(limit = 20) {
    return this.alerts.slice(0, limit);
  }

  // Get alert summary
  getAlertSummary() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentAlerts = this.alerts.filter(alert => 
      new Date(alert.timestamp) > last24h
    );

    const summary = {
      total: recentAlerts.length,
      critical: recentAlerts.filter(a => a.severity === 'critical').length,
      warning: recentAlerts.filter(a => a.severity === 'warning').length,
      info: recentAlerts.filter(a => a.severity === 'info').length,
      byType: {}
    };

    // Count by type
    recentAlerts.forEach(alert => {
      summary.byType[alert.type] = (summary.byType[alert.type] || 0) + 1;
    });

    return summary;
  }

  // Clear old alerts
  clearOldAlerts(daysToKeep = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    this.alerts = this.alerts.filter(alert => 
      new Date(alert.timestamp) > cutoffDate
    );
  }

  // Update thresholds
  updateThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    console.log('📊 Alert thresholds updated:', this.thresholds);
  }
}

// Create singleton instance
const alertSystem = new AlertSystem();

// Clean up old alerts every hour
setInterval(() => {
  alertSystem.clearOldAlerts();
}, 60 * 60 * 1000);

module.exports = alertSystem;