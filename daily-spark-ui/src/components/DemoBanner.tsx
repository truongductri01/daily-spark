import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DemoBannerProps {
  className?: string;
}

const DemoBanner: React.FC<DemoBannerProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <AlertTriangle className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0" />
      <div>
        <h3 className="text-sm font-medium text-amber-800">
          Demo Mode
        </h3>
        <p className="text-sm text-amber-700 mt-1">
          You're currently using a demo account. You can view curricula but cannot create or edit content.
        </p>
      </div>
    </div>
  );
};

export default DemoBanner;
