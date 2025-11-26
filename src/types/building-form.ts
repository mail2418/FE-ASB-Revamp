// Defines the structure for a single row's state in the form
export interface ComponentRowState {
  classificationKey: string; // e.g., 'pondasi_batu_kali', 'struktur_beton_k250'
  percentage: number; // 0 to 100
  checked?: boolean; // Optional checkbox state for non-standard components
}

// The overall state object holding data for all rows, keyed by a unique row ID
export interface BuildingFormState {
  [rowId: string]: ComponentRowState;
}

// Definition for the dropdown options
export interface ClassificationOption {
    id: string;
    name: string;
    satuan: string;
    harga: number;
}

// Mock data for dropdowns to match the image
export const MOCK_CLASSIFICATIONS: Record<string, ClassificationOption[]> = {
    'pondasi': [
        { id: 'pondasi_batu_kali', name: 'Pondasi Batu Kali', satuan: 'm3', harga: 1500000 },
        { id: 'pondasi_tiang_pancang', name: 'Pondasi Tiang Pancang', satuan: 'm', harga: 2500000 },
    ],
    'struktur': [
        { id: 'struktur_beton_k250', name: 'Struktur Beton K-250', satuan: 'm3', harga: 4500000 },
        { id: 'struktur_baja_wf', name: 'Struktur Baja WF', satuan: 'kg', harga: 35000 },
    ],
    'lantai': [
         { id: 'lantai_keramik_60x60', name: 'Lantai Keramik 60x60', satuan: 'm2', harga: 250000 },
    ],
    'dinding_luar': [
        { id: 'dinding_bata_ringan', name: 'Dinding Bata Ringan diplester', satuan: 'm2', harga: 180000 },
    ],
     'dinding_dalam': [
        { id: 'dinding_partisi_gypsum', name: 'Partisi Gypsum 2 sisi', satuan: 'm2', harga: 120000 },
    ],
     'plafond': [
        { id: 'plafond_gypsum', name: 'Plafond Gypsum Rangka Hollow', satuan: 'm2', harga: 150000 },
    ],
    'atap': [
        { id: 'atap_genteng_keramik', name: 'Atap Genteng Keramik berglazur', satuan: 'm2', harga: 350000 },
    ]
    // Add others as needed...
};