import React from 'react';
import { Save, X } from 'lucide-react';

interface AddRowButtonsProps {
  onSave: () => void;
  onCancel: () => void;
}

export default function AddRowButtons({ onSave, onCancel }: AddRowButtonsProps) {
  return (
    <div className="flex justify-end gap-2">
      <button onClick={onSave} className="text-green-600 hover:text-green-900">
        <Save className="w-5 h-5" />
      </button>
      <button onClick={onCancel} className="text-gray-600 hover:text-gray-900">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
