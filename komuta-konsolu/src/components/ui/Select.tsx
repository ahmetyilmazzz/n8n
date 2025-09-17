// src/components/ui/Select.tsx
import React from 'react';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = ({ children, ...props }: SelectProps) => (
  <select {...props} className="select-field">
    {children}
  </select>
);