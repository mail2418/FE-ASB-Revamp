'use client';

import { BuildingFormState, ComponentRowState } from '@/types/building-form';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EditNonStandardBuildingContextType {
  formState: BuildingFormState;
  updateRowState: (rowId: string, newState: Partial<ComponentRowState>) => void;
  setFormState: React.Dispatch<React.SetStateAction<BuildingFormState>>;
}

const EditNonStandardBuildingContext = createContext<EditNonStandardBuildingContextType | undefined>(undefined);

export function EditNonStandardBuildingProvider({ children }: { children: ReactNode }) {
  const [formState, setFormState] = useState<BuildingFormState>({});

  const updateRowState = (rowId: string, newState: Partial<ComponentRowState>) => {
    setFormState((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], ...newState },
    }));
  };

  return (
    <EditNonStandardBuildingContext.Provider value={{ formState, updateRowState, setFormState }}>
      {children}
    </EditNonStandardBuildingContext.Provider>
  );
}

export function useEditNonStandardBuildingContext() {
  const context = useContext(EditNonStandardBuildingContext);
  if (context === undefined) {
    throw new Error('useEditNonStandardBuildingContext must be used within an EditNonStandardBuildingProvider');
  }
  return context;
}
