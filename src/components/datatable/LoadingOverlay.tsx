// components/datatable/LoadingOverlay.tsx
import React from 'react';

interface LoadingOverlayProps {
  loading: boolean;
}

export function LoadingOverlay({ loading }: LoadingOverlayProps) {
  if (!loading) return null;
  
  return (
    <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
      <div className="bg-white p-3 rounded-lg shadow-md">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
          <span>Loading...</span>
        </div>
      </div>
    </div>
  );
}