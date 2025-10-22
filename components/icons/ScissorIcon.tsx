import React from 'react';

export const ScissorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M7.848 8.25l1.536.887M7.848 8.25a3 3 0 11-5.196-3 3 3 0 015.196 3zm1.536.887a2.167 2.167 0 01-2.433 2.433 2.167 2.167 0 01-2.434-2.433m2.434 2.433L9.384 10.137m0-1.887l1.536-.887m-1.536.887a3 3 0 10-5.196-3 3 3 0 005.196 3zm1.536.887a2.167 2.167 0 002.433 2.433 2.167 2.167 0 002.434-2.433m-2.434 2.433L14.616 10.137m0-1.887l-1.536-.887m3.84 5.992c.307.532.446 1.14.346 1.742a4.493 4.493 0 01-8.088 1.458 4.493 4.493 0 018.088-1.458z"
    />
  </svg>
);