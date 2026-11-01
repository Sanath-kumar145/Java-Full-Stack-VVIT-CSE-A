import React from 'react';

export const LoadingSpinner: React.FC<{ text?: string }> = ({ text = 'Loading ThinkMart products...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-10 h-10 border-4 border-purple/20 border-t-purple rounded-full animate-spin"></div>
      <p className="mt-4 text-sm font-semibold text-muted tracking-wide animate-pulse">{text}</p>
    </div>
  );
};

export default LoadingSpinner;

