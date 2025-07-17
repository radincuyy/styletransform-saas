import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import MonitoringDashboard from '../components/MonitoringDashboard';
import { Navigate } from 'react-router-dom';

const Monitoring = () => {
    const { currentUser: user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Only allow admin users (you can customize this logic)
    const isAdmin = user && (
        user.email === 'admin@styletransform.com' ||
        user.uid === 'admin' ||
        user.email?.includes('admin') ||
        // Add your email here for admin access
        user.email === 'radincuyy@gmail.com' ||
        // TEMPORARY: Allow all users for development testing (remove in production)
        process.env.NODE_ENV === 'development'
    );

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-4">
                        You don't have permission to access the monitoring dashboard.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <MonitoringDashboard />
            </div>
        </div>
    );
};

export default Monitoring;