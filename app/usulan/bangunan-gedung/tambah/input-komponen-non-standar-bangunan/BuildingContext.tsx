'use client';

import { BuildingFormState, ComponentRowState } from '@/types/building-form';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BuildingContextType {
  formState: BuildingFormState;
  updateRowState: (rowId: string, newState: Partial<ComponentRowState>) => void;
}

const BuildingContext = createContext<BuildingContextType | undefined>(undefined);

export function BuildingProvider({ children }: { children: ReactNode }) {
  // Initialize with non-standard component states
  const [formState, setFormState] = useState<BuildingFormState>({
    'row_pondasi': { classificationKey: 'pondasi_checked', percentage: 0 },
    'row_struktur': { classificationKey: 'struktur_checked', percentage: 0 },
    'row_lantai': { classificationKey: 'lantai_checked', percentage: 0 },
    'row_dinding': { classificationKey: 'dinding_checked', percentage: 0 },
    'row_atap': { classificationKey: 'atap_checked', percentage: 0 },
    'row_utilitas': { classificationKey: 'utilitas_checked', percentage: 0 },
    'row_finishing': { classificationKey: 'finishing_checked', percentage: 0 },
  });

  // Load saved state on mount
  React.useEffect(() => {
    const savedData = localStorage.getItem('usulan_bangunan_nonstandar_components');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormState(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse saved non-standard building component data', e);
      }
    }
  }, []);

  const updateRowState = (rowId: string, newState: Partial<ComponentRowState>) => {
    setFormState((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], ...newState },
    }));
  };

  return (
    <BuildingContext.Provider value={{ formState, updateRowState }}>
      {children}
    </BuildingContext.Provider>
  );
}

export function useBuildingContext() {
  const context = useContext(BuildingContext);
  if (context === undefined) {
    throw new Error('useBuildingContext must be used within a BuildingProvider');
  }
  return context;
}
