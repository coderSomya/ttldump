// src/app/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  children,
  className = '',
  ...props
}) => {
  const baseClass = 'ttldump-button';
  const variantClass = variant === 'outline' ? ' ttldump-button-outline' : '';
  
  return (
    <button 
      className={`${baseClass}${variantClass} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
