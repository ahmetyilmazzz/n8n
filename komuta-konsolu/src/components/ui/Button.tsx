// src/components/ui/Button.tsx
import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'active' | 'secondary';
};

export const Button = ({ children, variant = 'default', ...props }: ButtonProps) => (
  <button 
    {...props} 
    className={`btn ${variant === 'active' ? 'btn-active' : variant === 'secondary' ? 'btn-secondary' : ''}`}
  >
    {children}
  </button>
);