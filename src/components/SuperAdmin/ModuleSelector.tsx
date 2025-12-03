import React from 'react';
import { Database, ChevronDown } from 'lucide-react';
import { ModuleType, ModuleOption } from './types';

interface ModuleSelectorProps {
  modules: ModuleOption[];
  selectedModule: ModuleType | null;
  isOpen: boolean;
  onSelect: (module: ModuleType) => void;
  onToggle: () => void;
}

export default function ModuleSelector({ 
  modules, 
  selectedModule, 
  isOpen, 
  onSelect, 
  onToggle 
}: ModuleSelectorProps) {
  const selectedLabel = modules.find(m => m.value === selectedModule)?.label || 'Pilih Module';

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Database className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
          {modules.map((module) => (
            <button
              key={module.value}
              onClick={() => onSelect(module.value)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                selectedModule === module.value ? 'bg-gray-50 text-red-600 font-medium' : 'text-gray-700'
              }`}
            >
              {module.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
