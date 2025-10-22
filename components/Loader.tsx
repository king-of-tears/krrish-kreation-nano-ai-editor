import React from 'react';

interface LoaderProps {
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message = "AI is thinking..." }) => (
  <div className="flex flex-col items-center justify-center gap-4">
    <div
      className="w-12 h-12 simple-spinner"
      role="status"
      aria-label="loading"
    ></div>
    <p className="text-lg font-medium rainbow-text loader-rainbow-glow">{message}</p>
  </div>
);