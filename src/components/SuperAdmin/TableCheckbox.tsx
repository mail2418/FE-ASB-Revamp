import React from 'react';

interface TableCheckboxProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TableCheckbox({ checked, onChange }: TableCheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
    />
  );
}
