import React from 'react';

export const Spinner: React.FC = () => (
  <div className="flex justify-center items-center space-x-2">
    <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
  </div>
);