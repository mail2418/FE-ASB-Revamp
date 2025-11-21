'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useBuildingContext } from './BuildingContext';
import { MOCK_CLASSIFICATIONS, ClassificationOption } from '@/types/building-form';

// Helper component for table header rows (e.g., A. SUB STRUKTUR)
const SectionHeaderRow = ({ title }: { title: string }) => (
  <tr className="bg-blue-50">
    <td colSpan={7} className="py-3 px-4 text-sm font-bold text-blue-800 uppercase tracking-wider">
      {title}
    </td>
  </tr>
);

// Helper component for group sub-header rows (e.g., 1. Pekerjaan Tanah)
const GroupHeaderRow = ({ title }: { title: string }) => (
  <tr className="bg-gray-50">
    <td colSpan={7} className="py-2 px-4 text-sm font-semibold text-gray-700 pl-8">
      {title}
    </td>
  </tr>
);

export default function LeftPanelForm() {
  const router = useRouter();
  const { formState, updateRowState } = useBuildingContext();

  // Helper to render a data input row
  const renderInputRow = (rowId: string, label: string, classificationType: string) => {
    const currentState = formState[rowId];
    const options = MOCK_CLASSIFICATIONS[classificationType] || [];
    const selectedOption = options.find(opt => opt.id === currentState?.classificationKey) || options[0];

    const handleClassificationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateRowState(rowId, { classificationKey: e.target.value });
    };

    const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Ensure value is between 0 and 100
        let val = parseInt(e.target.value) || 0;
        val = Math.max(0, Math.min(100, val));
        updateRowState(rowId, { percentage: val });
    };

    return (
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="py-3 px-4 text-sm text-gray-600 pl-12">{label}</td>
        <td className="py-2 px-2">
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            value={currentState?.classificationKey}
            onChange={handleClassificationChange}
          >
            {options.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
        </td>
        <td className="py-2 px-2">
          <input type="text" disabled className="block w-full bg-gray-100 rounded-md border-gray-300 sm:text-sm p-2 border text-gray-500 italic" value="Sesuai standar..." />
        </td>
        <td className="py-3 px-4 text-sm text-center text-gray-600">{selectedOption?.satuan}</td>
        <td className="py-3 px-4 text-sm text-right text-gray-600">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedOption?.harga || 0)}
        </td>
        <td className="py-2 px-2">
          <div className="flex items-center">
            <input
              type="number"
              min="0"
              max="100"
              className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border text-right pr-8 relative z-10"
              value={currentState?.percentage || 0}
              onChange={handlePercentageChange}
            />
            <span className="text-gray-500 -ml-6 z-20">%</span>
          </div>
           {/* Visual percentage bar below input */}
           <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${currentState?.percentage || 0}%` }}></div>
            </div>
        </td>
        <td className="py-3 px-4 text-center">
           <button className="text-red-500 hover:text-red-700">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
           </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">Uraian Pekerjaan</th>
            <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900 w-64">Klasifikasi Standar</th>
            <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">Spesifikasi</th>
            <th scope="col" className="py-3.5 px-4 text-center text-sm font-semibold text-gray-900 w-20">Satuan</th>
            <th scope="col" className="py-3.5 px-4 text-right text-sm font-semibold text-gray-900 w-32">Harga Satuan</th>
            <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900 w-40">Prosentase Pembangunan</th>
            <th scope="col" className="py-3.5 px-4 text-center text-sm font-semibold text-gray-900 w-16">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <SectionHeaderRow title="A. SUB STRUKTUR" />
          <GroupHeaderRow title="1. Pekerjaan Tanah" />
          {/* Add tanah inputs here if needed */}
          <GroupHeaderRow title="2. Pekerjaan Pondasi" />
          {renderInputRow('row_pondasi', 'a. Pondasi', 'pondasi')}

          <SectionHeaderRow title="B. STRUKTUR ATAS" />
          <GroupHeaderRow title="1. Struktur Beton" />
          {renderInputRow('row_struktur_lt1', 'a. Struktur Lantai 1 (Kolom, Balok, Plat)', 'struktur')}
          {renderInputRow('row_struktur_lt2', 'b. Struktur Lantai 2 (Kolom, Balok, Plat)', 'struktur')}
          <GroupHeaderRow title="2. Struktur Atap" />
          {/* Add struktur atap inputs here */}

          <SectionHeaderRow title="C. ARSITEKTUR" />
          <GroupHeaderRow title="1. Pekerjaan Lantai" />
          {renderInputRow('row_lantai_lt1', 'a. Lantai 1', 'lantai')}
          {renderInputRow('row_lantai_lt2', 'b. Lantai 2', 'lantai')}
          <GroupHeaderRow title="2. Pekerjaan Dinding" />
          {renderInputRow('row_dinding_luar', 'a. Dinding Luar', 'dinding_luar')}
          {renderInputRow('row_dinding_dalam', 'b. Dinding Dalam (Partisi)', 'dinding_dalam')}
          <GroupHeaderRow title="3. Pekerjaan Plafond" />
          {renderInputRow('row_plafond', 'a. Plafond Dalam', 'plafond')}
           <GroupHeaderRow title="4. Pekerjaan Penutup Atap" />
          {renderInputRow('row_atap', 'a. Penutup Atap', 'atap')}

        </tbody>
      </table>

      {/* Navigation Buttons */}
      <div className="flex justify-between p-6 bg-gray-50 border-t border-gray-200">
        <button
          onClick={() => router.push('/usulan/bangunan-gedung/tambah')}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium flex items-center gap-2 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Previous
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            // Save state
            localStorage.setItem('usulan_bangunan_standar_components', JSON.stringify(formState));
            // Navigate to next page
            router.push('/usulan/bangunan-gedung/tambah/input-komponen-non-standar-bangunan');
          }}
          className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium flex items-center gap-2 cursor-pointer"
        >
          Next
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}