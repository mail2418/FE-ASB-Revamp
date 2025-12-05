'use client';

import { BuildingFormState, ComponentRowState } from '@/types/building-form';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Komponen mapping for 3D visualization
const KOMPONEN_TO_3D_TYPE: { [key: string]: string } = {
  'pondasi': 'pondasi',
  'struktur': 'struktur',
  'struktur (kolom, balok & ring balk)': 'struktur',
  'struktur (plesteran)': 'struktur',
  'lantai': 'lantai',
  'lantai (penutup lantai)': 'lantai',
  'dinding': 'dinding',
  'dinding (batu bata / partisi)': 'dinding',
  'dinding (plesteran)': 'dinding',
  'dinding (kaca)': 'dinding_kaca',
  'dinding (pintu)': 'pintu',
  'dinding (kosen)': 'pintu',
  'atap': 'atap',
  'atap (rangka)': 'atap',
  'atap (penutup)': 'atap',
  'plafon': 'plafon',
  'langit - langit (rangka)': 'plafon',
  'langit - langit (penutup)': 'plafon',
  'utilitas': 'utilitas',
  'utilitas (instalasi listrik)': 'utilitas',
  'utilitas (instalasi air)': 'utilitas',
  'utilitas (drainase limbah)': 'utilitas',
  'finishing': 'finishing',
  'finishing (cat struktur)': 'finishing',
  'finishing (cat langit langit)': 'finishing',
  'finishing (cat dinding)': 'finishing',
  'finishing (cat pintu/kosen)': 'finishing',
  'pintu': 'pintu',
};

// Helper to get 3D type from komponen name
export const get3DTypeFromKomponen = (komponen: string): string => {
  const normalized = komponen.toLowerCase().trim();
  return KOMPONEN_TO_3D_TYPE[normalized] || 'default';
};

interface BuildingContextType {
  formState: BuildingFormState;
  updateRowState: (rowId: string, newState: Partial<ComponentRowState>) => void;
  getAggregatedStateByKey: (classificationKeyPrefix: string) => { totalPercentage: number, count: number };
  initializeComponentStates: (components: Array<{ id: number; komponen: string }>) => void;
  setFormState: React.Dispatch<React.SetStateAction<BuildingFormState>>;
}

const BuildingContext = createContext<BuildingContextType | undefined>(undefined);

export function EditBuildingProvider({ children }: { children: ReactNode }) {
  const [formState, setFormState] = useState<BuildingFormState>({});

  // Initialize component states from API data
  const initializeComponentStates = (components: Array<{ id: number; komponen: string }>) => {
    const newState: BuildingFormState = {};
    components.forEach(component => {
      const rowKey = `row_${component.id}`;
      if (!formState[rowKey]) {
        newState[rowKey] = { percentage: 0 };
      }
    });
    if (Object.keys(newState).length > 0) {
      setFormState(prev => ({ ...prev, ...newState }));
    }
  };

  const updateRowState = (rowId: string, newState: Partial<ComponentRowState>) => {
    setFormState((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], ...newState },
    }));
  };

  const getAggregatedStateByKey = (type3D: string) => {
    let totalPercentage = 0;
    let count = 0;

    Object.keys(formState).forEach(key => {
      if (formState[key]?.percentage) {
        const percentage = formState[key].percentage || 0;
        totalPercentage += percentage;
        count++;
      }
    });

    return { 
      totalPercentage: count > 0 ? totalPercentage / count : 0, 
      count 
    };
  };

  return (
    <BuildingContext.Provider value={{ 
      formState, 
      updateRowState, 
      getAggregatedStateByKey,
      initializeComponentStates,
      setFormState
    }}>
      {children}
    </BuildingContext.Provider>
  );
}

export function useEditBuildingContext() {
  const context = useContext(BuildingContext);
  if (context === undefined) {
    throw new Error('useEditBuildingContext must be used within an EditBuildingProvider');
  }
  return context;
}
