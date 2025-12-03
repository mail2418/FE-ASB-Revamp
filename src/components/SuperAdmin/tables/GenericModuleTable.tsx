import React from 'react';
import TableInput from '../TableInput';
import TableCheckbox from '../TableCheckbox';
import ActionButtons from '../ActionButtons';
import AddRowButtons from '../AddRowButtons';

interface GenericModuleTableProps {
  data: any[];
  setData: (data: any[]) => void;
  headers: string[];
  fields: string[];
  types: string[];
  newItem: any;
  setNewItem: (item: any) => void;
  editingId: number | null;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onSaveEdit: (id: number) => void;
  onCancelEdit: () => void;
  isAdding: boolean;
  onSaveNew: () => void;
  onCancelAdd: () => void;
}

export default function GenericModuleTable({
  data,
  setData,
  headers,
  fields,
  types,
  newItem,
  setNewItem,
  editingId,
  onEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  isAdding,
  onSaveNew,
  onCancelAdd,
}: GenericModuleTableProps) {
  const updateItem = (id: number, field: string, value: any) => {
    setData(data.map((item: any) => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map(header => (
              <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{header}</th>
            ))}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              {fields.map((field, idx) => (
                <td key={field} className="px-6 py-4 whitespace-nowrap">
                  {editingId === item.id ? (
                    types[idx] === 'boolean' ? (
                      <TableCheckbox checked={item[field]} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(item.id, field, e.target.checked)} />
                    ) : (
                      <TableInput 
                        type={types[idx]} 
                        value={item[field]} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(item.id, field, types[idx] === 'number' ? (e.target.value === '' ? 0 : parseFloat(e.target.value) || 0) : e.target.value)} 
                        className={types[idx] === 'number' ? 'w-24' : 'w-full'}
                      />
                    )
                  ) : (
                    types[idx] === 'boolean' ? (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${item[field] ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {item[field] ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-900">{item[field]}</span>
                    )
                  )}
                </td>
              ))}
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
              {fields.map((field, idx) => (
                <td key={field} className="px-6 py-4">
                  {types[idx] === 'boolean' ? (
                    <TableCheckbox checked={newItem[field]} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({...newItem, [field]: e.target.checked})} />
                  ) : (
                    <TableInput 
                      type={types[idx]} 
                      value={newItem[field]} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({...newItem, [field]: types[idx] === 'number' ? (e.target.value === '' ? 0 : parseFloat(e.target.value) || 0) : e.target.value})} 
                      placeholder={headers[idx]}
                      className={types[idx] === 'number' ? 'w-24' : 'w-full'}
                    />
                  )}
                </td>
              ))}
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
