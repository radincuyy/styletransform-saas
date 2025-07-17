import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '../utils/api';

const MonitoringDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [health, setHealth] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDays, setSelectedDays] = useState(7);

  const fetchMonitoringData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all monitoring data in parallel
      const [statsRes, analyticsRes, healthRes, alertsRes] = await Promise.all([
        api.get('/monitoring/stats'),
        api.get(`/monitoring/analytics?days=${selectedDays}`),
        axios.get('http://localhost:5000/health'), // Health endpoint is not under /api
        api.get('/monitoring/alerts?limit=20')
      ]);

      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
      setHealth(healthRes.data);
      setAlerts(alertsRes.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch monitoring data:', err);
      
      // More detailed error handling
      if (err.response) {
        // Server responded with error status
        setError(`Server error: ${err.response.status} - ${err.response.data?.error || err.response.statusText}`);
      } else if (err.request) {
        // Request was made but no response received
        setError('Cannot connect to server. Please check if backend is running on port 5000.');
      } else {
        // Something else happened
        setError(`Request error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedDays]);

  // Fetch monitoring data on component mount and when selectedDays changes
  useEffect(() => {
    fetchMonitoringData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchMonitoringData, 30000);
    return () => clearInterval(interval);
  }, [fetchMonitoringData]);

  const formatUptime = (uptime) => {
    if (!uptime) return 'Unknown';
    return uptime;
  };

  const formatMemory = (memory) => {
    if (!memory) return 'Unknown';
    return `${memory.used} / ${memory.total}`;
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading monitoring data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Monitoring Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button 
              onClick={fetchMonitoringData}
              className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">System Monitoring</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <select 
            value={selectedDays} 
            onChange={(e) => setSelectedDays(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <button 
            onClick={fetchMonitoringData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm whitespace-nowrap"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
            {alerts.summary && (
              <div className="flex space-x-2 text-sm">
                {alerts.summary.critical > 0 && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                    {alerts.summary.critical} Critical
                  </span>
                )}
                {alerts.summary.warning > 0 && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    {alerts.summary.warning} Warning
                  </span>
                )}
                {alerts.summary.total === 0 && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    No Active Alerts
                  </span>
                )}
              </div>
            )}
          </div>

          {alerts.alerts && alerts.alerts.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.alerts.map((alert, index) => (
                <div 
                  key={index} 
                  className={`border rounded-lg p-4 ${
                    alert.severity === 'critical' 
                      ? 'bg-red-50 border-red-200' 
                      : alert.severity === 'warning'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          alert.severity === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : alert.severity === 'warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-gray-600">
                          {alert.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 mt-1">{alert.message}</p>
                      {alert.value !== undefined && (
                        <p className="text-xs text-gray-500 mt-1">
                          Value: {typeof alert.value === 'number' ? alert.value.toFixed(3) : alert.value} 
                          {alert.threshold && ` (Threshold: ${alert.threshold})`}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 ml-4">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-500">No alerts at this time. System is running smoothly!</p>
            </div>
          )}
        </div>
      )}

      {/* System Health */}
      {health && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-green-800">Status: {health.status}</span>
              </div>
              <p className="text-xs text-green-600 mt-1">System is running normally</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-800">Uptime</div>
              <p className="text-lg font-bold text-blue-900">{formatUptime(health.uptime)}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-purple-800">Memory Usage</div>
              <p className="text-lg font-bold text-purple-900">{formatMemory(health.memory)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Stats */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-600">Total API Calls</div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalApiCalls || 0}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-red-600">Total Errors</div>
              <p className="text-2xl font-bold text-red-900">{stats.totalErrors || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-600">Unique Users</div>
              <p className="text-2xl font-bold text-green-900">{stats.uniqueUsers || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Summary */}
      {analytics && !analytics.error && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Summary ({selectedDays} days)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-600">Total Events</div>
              <p className="text-2xl font-bold text-blue-900">{analytics.totalEvents || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-600">Unique Users</div>
              <p className="text-2xl font-bold text-green-900">{analytics.uniqueUsers || 0}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-purple-600">Generations</div>
              <p className="text-2xl font-bold text-purple-900">
                {analytics.eventBreakdown?.generation_requested || 0}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-yellow-600">New Users</div>
              <p className="text-2xl font-bold text-yellow-900">
                {analytics.eventBreakdown?.user_registered || 0}
              </p>
            </div>
          </div>

          {/* Event Breakdown */}
          {analytics.eventBreakdown && Object.keys(analytics.eventBreakdown).length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Event Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(analytics.eventBreakdown).map(([event, count]) => (
                  <div key={event} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700 capitalize">{event.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Errors */}
          {analytics.errors && analytics.errors.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Recent Errors</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analytics.errors.slice(0, 10).map((error, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">{error.error}</p>
                        <p className="text-xs text-red-600 mt-1">
                          {error.endpoint} - User: {error.userId}
                        </p>
                      </div>
                      <span className="text-xs text-red-500">
                        {new Date(error.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Daily Stats Chart */}
      {analytics && analytics.dailyStats && Object.keys(analytics.dailyStats).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity</h3>
          <div className="space-y-3">
            {Object.entries(analytics.dailyStats)
              .sort(([a], [b]) => new Date(b) - new Date(a))
              .slice(0, 7)
              .map(([date, data]) => (
                <div key={date} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700">{date}</span>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-blue-600">{data.events} events</span>
                    <span className="text-green-600">{data.users} users</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoringDashboard;