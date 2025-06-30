import React from 'react';

// Inline SVG for bolt.new icon
export const BoltNewIcon = ({ className = 'w-7 h-7', ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <rect width="32" height="32" rx="16" fill="#000"/>
    <path d="M16 6L12 18H16L12 26L20 14H16L20 6H16Z" fill="#fff"/>
  </svg>
);
