import React from 'react';
import { FungsiRuangData } from '../types';
import TableInput from '../TableInput';
import TableCheckbox from '../TableCheckbox';
import ActionButtons from '../ActionButtons';
import AddRowButtons from '../AddRowButtons';

interface FungsiRuangTableProps {
  data: FungsiRuangData[];
  editingId: number | null;
  onUpdate: (id: number, field: keyof FungsiRuangData, value: any) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onSaveEdit: (id: number) => void;
  onCancelEdit: () => void;
  isAdding: boolean;
  newRow: FungsiRuangData;
  onNewRowChange: (field: keyof FungsiRuangData, value: any) => void;
  onSaveNew: () => void;
  onCancelAdd: () => void;
}

export default function FungsiRuangTable({
  data,
  editingId,
  onUpdate,
  onEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  isAdding,
  newRow,
  onNewRowChange,
  onSaveNew,
  onCancelAdd,
}: FungsiRuangTableProps) {
  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : [];
  
  // Debug logging
  React.useEffect(() => {
    console.log('FungsiRuangTable received data:', data);
    console.log('Is array?', Array.isArray(data));
  }, [data]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Fungsi Ruang</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Koefisien</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {safeData.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                {editingId === item.id ? (
                  <TableInput 
                    type="text" 
                    value={item.nama_fungsi_ruang} 
                    onChange={(e) => onUpdate(item.id, 'nama_fungsi_ruang', e.target.value)} 
                    className="w-full" 
                  />
                ) : (
                  <span className="text-sm text-gray-900">{item.nama_fungsi_ruang}</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingId === item.id ? (
                  <TableInput 
                    type="number" 
                    step="0.1" 
                    value={item.koef} 
                    onChange={(e) => onUpdate(item.id, 'koef', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)} 
                    className="w-24" 
                  />
                ) : (
                  <span className="text-sm text-gray-900">{item.koef}</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingId === item.id ? (
                  <TableCheckbox 
                    checked={item.isActive} 
                    onChange={(e) => onUpdate(item.id, 'isActive', e.target.checked)} 
                  />
                ) : (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <ActionButtons 
                  id={item.id} 
                  isEditing={editingId === item.id}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onSave={onSaveEdit}
                  onCancel={onCancelEdit}
                />
              </td>
            </tr>
          ))}
          {isAdding && (
            <tr className="bg-blue-50">
              <td className="px-6 py-4">
                <TableInput 
                  type="text" 
                  value={newRow.nama_fungsi_ruang} 
                  onChange={(e) => onNewRowChange('nama_fungsi_ruang', e.target.value)} 
                  placeholder="Nama" 
                  className="w-full" 
                />
              </td>
              <td className="px-6 py-4">
                <TableInput 
                  type="number" 
                  step="0.1" 
                  value={newRow.koef} 
                  onChange={(e) => onNewRowChange('koef', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)} 
                  className="w-24" 
                />
              </td>
              <td className="px-6 py-4">
                <TableCheckbox 
                  checked={newRow.isActive} 
                  onChange={(e) => onNewRowChange('isActive', e.target.checked)} 
                />
              </td>
              <td className="px-6 py-4 text-right">
                <AddRowButtons onSave={onSaveNew} onCancel={onCancelAdd} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
