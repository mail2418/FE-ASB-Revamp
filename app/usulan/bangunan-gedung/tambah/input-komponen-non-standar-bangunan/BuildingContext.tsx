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
    'row_alat_pengkondisi_udara': { percentage: 0 },
    'row_elevator_escalator': { percentage: 0 },
    'row_tata_suara': { percentage: 0 },
    'row_telepon_pabx': { percentage: 0 },
    'row_instalasi_it': { percentage: 0 },
    'row_elektrikal': { percentage: 0 },
    'row_sistem_proteksi_kebakaran': { percentage: 0 },
    'row_penangkal_petir_khusus': { percentage: 0 },
    'row_ipal': { percentage: 0 },
    'row_interior_furniture': { percentage: 0 },
    'row_gas_pembakaran': { percentage: 0 },
    'row_gas_medis': { percentage: 0 },
    'row_pencegahan_bahaya_rayap': { percentage: 0 },
    'row_pondasi_dalam': { percentage: 0 },
    'row_fasilitas_disabilitas': { percentage: 0 },
    'row_sarana_prasarana_lingkungan': { percentage: 0 },
    'row_peningkatan_mutu': { percentage: 0 },
    'row_perizinan_selain_imb': { percentage: 0 },
    'row_penyiapan_pematangan_lahan': { percentage: 0 },
    'row_bangunan_gedung_hijau': { percentage: 0 },
    'row_penyambungan_utilitas': { percentage: 0 },
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

  if (context === undefined) {
    throw new Error('useNonStandardBuildingContext must be used within a NonStandardBuildingProvider');
  }
  return context;
}
