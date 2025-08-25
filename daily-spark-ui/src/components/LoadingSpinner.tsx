import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  className = '',
  text
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <svg
          className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {text && (
          <p className="text-sm text-gray-600 animate-pulse">{text}</p>
        )}
      </div>
    </div>
  );
}

// Full page loading spinner
export function FullPageSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
      <LoadingSpinner size="xl" text={text} />
    </div>
  );
}

// Button loading spinner
export function ButtonSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <LoadingSpinner 
      size={size} 
      color="white" 
      className="inline-block"
    />
  );
}

// Skeleton loading component
interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className = '', lines = 1 }: SkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          data-testid={`skeleton-line-${index}`}
          className={`bg-gray-200 rounded h-4 mb-2 ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

// Card skeleton
export function CardSkeleton() {
  return (
    <div data-testid="card-skeleton" className="bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div data-testid="card-avatar" className="bg-gray-200 rounded-full h-12 w-12"></div>
        <div className="flex-1">
          <div data-testid="card-title" className="bg-gray-200 rounded h-4 w-3/4 mb-2"></div>
          <div data-testid="card-subtitle" className="bg-gray-200 rounded h-3 w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div data-testid="card-content-line-0" className="bg-gray-200 rounded h-3 w-full"></div>
        <div data-testid="card-content-line-1" className="bg-gray-200 rounded h-3 w-5/6"></div>
        <div data-testid="card-content-line-2" className="bg-gray-200 rounded h-3 w-4/6"></div>
      </div>
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      <div data-testid="table-skeleton" className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div data-testid="table-header" className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="flex space-x-4">
            <div data-testid="table-header-cell-0" className="bg-gray-200 rounded h-4 w-1/4"></div>
            <div data-testid="table-header-cell-1" className="bg-gray-200 rounded h-4 w-1/4"></div>
            <div data-testid="table-header-cell-2" className="bg-gray-200 rounded h-4 w-1/4"></div>
            <div data-testid="table-header-cell-3" className="bg-gray-200 rounded h-4 w-1/4"></div>
          </div>
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} data-testid={`table-row-${index}`} className="px-6 py-4 border-b border-gray-200">
            <div className="flex space-x-4">
              <div data-testid={`table-row-cell-${index}-0`} className="bg-gray-200 rounded h-4 w-1/4"></div>
              <div data-testid={`table-row-cell-${index}-1`} className="bg-gray-200 rounded h-4 w-1/4"></div>
              <div data-testid={`table-row-cell-${index}-2`} className="bg-gray-200 rounded h-4 w-1/4"></div>
              <div data-testid={`table-row-cell-${index}-3`} className="bg-gray-200 rounded h-4 w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Loading overlay for components
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
}

export function LoadingOverlay({ isLoading, children, text = 'Loading...' }: LoadingOverlayProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}
