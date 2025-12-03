import React from 'react';

interface TableInputProps {
  type: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  placeholder?: string;
  step?: string;
}

export default function TableInput({ 
  type, 
  value, 
  onChange, 
  className = '', 
  placeholder = '', 
  step 
}: TableInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      step={step}
      className={`px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent ${className}`}
    />
  );
}
