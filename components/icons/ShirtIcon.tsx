import React from 'react';

export const ShirtIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 20.25l1.5-1.5M4.5 20.25V15M4.5 20.25H3m16.5 0l-1.5-1.5m1.5 1.5v-5.25m1.5 5.25H21M9 3.75v16.5M15 3.75v16.5M3 8.25h18M3 12h18m-9 8.25h.008v.008H12v-.008z"
    />
  </svg>
);