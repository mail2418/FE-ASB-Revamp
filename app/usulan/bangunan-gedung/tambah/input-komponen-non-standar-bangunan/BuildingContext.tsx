'use client';

import { BuildingFormState, ComponentRowState } from '@/types/building-form';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NonStandardBuildingContextType {
  formState: BuildingFormState;
  updateRowState: (rowId: string, newState: Partial<ComponentRowState>) => void;
}

const NonStandardBuildingContext = createContext<NonStandardBuildingContextType | undefined>(undefined);

export function NonStandardBuildingProvider({ children }: { children: ReactNode }) {
  // Initialize with non-standard component states
  const [formState, setFormState] = useState<BuildingFormState>({
    'row_alat_pengkondisi_udara': { classificationKey: 'checked', percentage: 0 },
    'row_elevator_escalator': { classificationKey: 'checked', percentage: 0 },
    'row_tata_suara': { classificationKey: 'checked', percentage: 0 },
    'row_telepon_pabx': { classificationKey: 'checked', percentage: 0 },
    'row_instalasi_it': { classificationKey: 'checked', percentage: 0 },
    'row_elektrikal': { classificationKey: 'checked', percentage: 0 },
    'row_sistem_proteksi_kebakaran': { classificationKey: 'checked', percentage: 0 },
    'row_penangkal_petir_khusus': { classificationKey: 'checked', percentage: 0 },
    'row_ipal': { classificationKey: 'checked', percentage: 0 },
    'row_interior_furniture': { classificationKey: 'checked', percentage: 0 },
    'row_gas_pembakaran': { classificationKey: 'checked', percentage: 0 },
    'row_gas_medis': { classificationKey: 'checked', percentage: 0 },
    'row_pencegahan_bahaya_rayap': { classificationKey: 'checked', percentage: 0 },
    'row_pondasi_dalam': { classificationKey: 'checked', percentage: 0 },
    'row_fasilitas_disabilitas': { classificationKey: 'checked', percentage: 0 },
    'row_sarana_prasarana_lingkungan': { classificationKey: 'checked', percentage: 0 },
    'row_peningkatan_mutu': { classificationKey: 'checked', percentage: 0 },
    'row_perizinan_selain_imb': { classificationKey: 'checked', percentage: 0 },
    'row_penyiapan_pematangan_lahan': { classificationKey: 'checked', percentage: 0 },
    'row_bangunan_gedung_hijau': { classificationKey: 'checked', percentage: 0 },
    'row_penyambungan_utilitas': { classificationKey: 'checked', percentage: 0 },
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
    <NonStandardBuildingContext.Provider value={{ formState, updateRowState}}>
      {children}
    </NonStandardBuildingContext.Provider>
  );
}

export function useNonStandardBuildingContext() {
  const context = useContext(NonStandardBuildingContext);
  console.log("context render non standar");
  console.info(context);
  if (context === undefined) {
    throw new Error('useNonStandardBuildingContext must be used within a NonStandardBuildingProvider');
  }
  return context;
}
