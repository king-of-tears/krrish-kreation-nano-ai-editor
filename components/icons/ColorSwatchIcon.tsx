import React from 'react';

export const ColorSwatchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402a3.75 3.75 0 00-5.304-5.304L4.098 14.6c-.432.432-.432 1.132 0 1.564z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.18 8.655c.26.26.26.68 0 .94l-1.06 1.06-2.08-2.08 1.06-1.06c.26-.26.68-.26.94 0l1.14 1.14zM12 6.375l2.08 2.08m-4.16 4.16l2.08 2.08"
    />
  </svg>
);