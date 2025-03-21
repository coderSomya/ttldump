// src/app/components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  id,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={id} 
          className="block mb-2 text-sm font-medium"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`ttldump-input ${className}`}
        {...props}
      />
    </div>
  );
};
