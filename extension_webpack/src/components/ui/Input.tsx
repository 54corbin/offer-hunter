import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input: React.FC<InputProps> = ({ className, error, ...props }) => {
  const baseStyles =
    'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm';
  
  const errorStyles = 'border-red-500 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500';

  return (
    <input
      className={`${baseStyles} ${error ? errorStyles : ''} ${className}`}
      {...props}
    />
  );
};

export default Input;
