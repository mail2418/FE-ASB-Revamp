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
}

const BuildingContext = createContext<BuildingContextType | undefined>(undefined);

export function BuildingProvider({ children }: { children: ReactNode }) {
  // Initialize with empty state - will be populated by API data
  const [formState, setFormState] = useState<BuildingFormState>({});

  // Load saved state on mount
  useEffect(() => {
    const savedData = localStorage.getItem('usulan_bangunan_standar_components');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Handle both old format (direct formState) and new format (with selectedComponents)
        if (parsed.formState) {
          setFormState(prev => ({ ...prev, ...parsed.formState }));
        } else {
          setFormState(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error('Failed to parse saved building component data', e);
      }
    }
  }, []);

  // Initialize component states from API data
  const initializeComponentStates = (components: Array<{ id: number; komponen: string }>) => {
    const newState: BuildingFormState = {};
    components.forEach(component => {
      const rowKey = `row_${component.id}`;
      // Only initialize if not already set
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

  // Helper function to get aggregated percentage by 3D type
  const getAggregatedStateByKey = (type3D: string) => {
    let totalPercentage = 0;
    let count = 0;

    Object.keys(formState).forEach(key => {
      if (formState[key]?.percentage) {
        // Check if this row matches the 3D type
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
      initializeComponentStates 
    }}>
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