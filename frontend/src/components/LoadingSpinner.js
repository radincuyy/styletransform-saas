import React from 'react';

// Simple Loading Spinner
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-500 ${sizeClasses[size]} ${className}`}></div>
  );
};

// Dashboard Stats Skeleton
export const StatsCardSkeleton = () => (
  <div className="card text-center p-4 animate-pulse">
    <div className="h-6 md:h-8 bg-gray-200 rounded mb-2"></div>
    <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
  </div>
);

// Image Upload Skeleton
export const ImageUploadSkeleton = () => (
  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 animate-pulse">
    <div className="text-center">
      <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
    </div>
  </div>
);

// Generated Image Skeleton
export const GeneratedImageSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-200"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  </div>
);

// History Item Skeleton
export const HistoryItemSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
    <div className="flex items-center space-x-4">
      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="w-8 h-8 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// Monitoring Dashboard Skeleton
export const MonitoringCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded mb-4"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

// Form Input Skeleton
export const FormSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div>
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
    <div>
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
    <div className="h-10 bg-gray-200 rounded"></div>
  </div>
);

// Page Loading Skeleton
export const PageLoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, index) => (
            <StatsCardSkeleton key={index} />
          ))}
        </div>
        
        {/* Main Content Skeleton */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <ImageUploadSkeleton />
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="space-y-6">
            <GeneratedImageSkeleton />
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default LoadingSpinner;