'use client';

import { BuildingFormState, ComponentRowState, MOCK_CLASSIFICATIONS } from '@/types/building-form';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BuildingContextType {
  formState: BuildingFormState;
  updateRowState: (rowId: string, newState: Partial<ComponentRowState>) => void;
  // Helper to get data for a specific classification key across the whole form
  getAggregatedStateByKey: (classificationKeyPrefix: string) => { totalPercentage: number, count: number };
}

const BuildingContext = createContext<BuildingContextType | undefined>(undefined);

export function BuildingProvider({ children }: { children: ReactNode }) {
  // Initialize with some default states matching the image IDs
  const [formState, setFormState] = useState<BuildingFormState>({
    'row_pondasi': { classificationKey: MOCK_CLASSIFICATIONS['pondasi'][0].id, percentage: 0 },
    'row_struktur_lt1': { classificationKey: MOCK_CLASSIFICATIONS['struktur'][0].id, percentage: 0 },
    'row_struktur_lt2': { classificationKey: MOCK_CLASSIFICATIONS['struktur'][0].id, percentage: 0 },
    'row_lantai_lt1': { classificationKey: MOCK_CLASSIFICATIONS['lantai'][0].id, percentage: 0 },
    'row_lantai_lt2': { classificationKey: MOCK_CLASSIFICATIONS['lantai'][0].id, percentage: 0 },
    'row_dinding_luar': { classificationKey: MOCK_CLASSIFICATIONS['dinding_luar'][0].id, percentage: 0 },
    'row_dinding_dalam': { classificationKey: MOCK_CLASSIFICATIONS['dinding_dalam'][0].id, percentage: 0 },
    'row_plafond': { classificationKey: MOCK_CLASSIFICATIONS['plafond'][0].id, percentage: 0 },
    'row_atap': { classificationKey: MOCK_CLASSIFICATIONS['atap'][0].id, percentage: 0 },
  });

  // Load saved state on mount
  React.useEffect(() => {
    const savedData = localStorage.getItem('usulan_bangunan_standar_components');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormState(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse saved building component data', e);
      }
    }
  }, []);

  const updateRowState = (rowId: string, newState: Partial<ComponentRowState>) => {
    setFormState((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], ...newState },
    }));
  };

  // Helper function used by 3D models to determine their overall progress.
  // E.g., aggregates percentage if there are multiple "struktur" rows.
  const getAggregatedStateByKey = (classificationKeyPrefix: string) => {
      let totalPercentage = 0;
      let count = 0;
      Object.values(formState).forEach(row => {
          if(row.classificationKey.startsWith(classificationKeyPrefix)) {
              totalPercentage += row.percentage || 0;
              count++;
          }
      })
      return { totalPercentage, count: count || 1 };
  }

  return (
    <BuildingContext.Provider value={{ formState, updateRowState, getAggregatedStateByKey }}>
      {children}
    </BuildingContext.Provider>
  );
}

export function useBuildingContext() {
  const context = useContext(BuildingContext);
  console.log("context render standar");
  console.info(context);
  if (context === undefined) {
    throw new Error('useBuildingContext must be used within a BuildingProvider');
  }
  return context;
}