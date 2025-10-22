import React from 'react';

export const CropIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
    >
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h10.5m-10.5 0V18c0 .828.672 1.5 1.5 1.5h1.5v-1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19.5h10.5a1.5 1.5 0 001.5-1.5V7.5" />
</svg>
);
