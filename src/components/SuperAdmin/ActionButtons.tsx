import React from 'react';
import { Edit2, Trash2, Save, X } from 'lucide-react';

interface ActionButtonsProps {
  id: number;
  isEditing: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onSave: (id: number) => void;
  onCancel: () => void;
}

export default function ActionButtons({ 
  id, 
  isEditing, 
  onEdit, 
  onDelete, 
  onSave, 
  onCancel 
}: ActionButtonsProps) {
  return (
    <div className="flex justify-end gap-2">
      {isEditing ? (
        <>
          <button onClick={() => onSave(id)} className="text-green-600 hover:text-green-900">
            <Save className="w-5 h-5" />
          </button>
          <button onClick={onCancel} className="text-gray-600 hover:text-gray-900">
            <X className="w-5 h-5" />
          </button>
        </>
      ) : (
        <>
          <button onClick={() => onEdit(id)} className="text-blue-600 hover:text-blue-900">
            <Edit2 className="w-5 h-5" />
          </button>
          <button onClick={() => onDelete(id)} className="text-red-600 hover:text-red-900">
            <Trash2 className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}
