'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useBuildingContext } from './BuildingContext';
import { MOCK_CLASSIFICATIONS, ClassificationOption } from '@/types/building-form';

// Helper component for table header rows (e.g., A. SUB STRUKTUR)
const SectionHeaderRow = ({ title }: { title: string }) => (
  <tr className="bg-blue-50">
    <td colSpan={5} className="py-3 px-4 text-sm font-bold text-blue-800 uppercase tracking-wider">
      {title}
    </td>
  </tr>
);

// Helper component for group sub-header rows (e.g., 1. Pekerjaan Tanah)
const GroupHeaderRow = ({ title }: { title: string }) => (
  <tr className="bg-gray-50">
    <td colSpan={5} className="py-2 px-4 text-sm font-semibold text-gray-700 pl-8">
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

    // Calculate Harga Persentase = Harga Satuan * Percentage / 100
    const hargaPersentase = ((selectedOption?.harga || 0) * (currentState?.percentage || 0)) / 100;

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
        <td className="py-3 px-4 text-sm text-right text-gray-600">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedOption?.harga || 0)}
        </td>
        <td className="py-2 px-2">
          <div className="flex items-center">
            <input
              type="number"
              min="0"
              max="100"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border text-right pr-8 relative z-10"
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
        <td className="py-3 px-4 text-sm text-right text-gray-900 font-semibold">
          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(hargaPersentase)}
        </td>
      </tr>
    );
  };

  // Calculate totals for all components
  const calculateTotals = () => {
    let totalHargaSatuan = 0;
    let totalHargaPersentase = 0;

    // Iterate through all form states to calculate totals
    Object.keys(formState).forEach(rowId => {
      const state = formState[rowId];
      if (state) {
        // Get classification type from rowId to find the correct options
        let classificationType = '';
        if (rowId.includes('pondasi')) classificationType = 'pondasi';
        else if (rowId.includes('struktur')) classificationType = 'struktur';
        else if (rowId.includes('lantai')) classificationType = 'lantai';
        else if (rowId.includes('dinding_luar')) classificationType = 'dinding_luar';
        else if (rowId.includes('dinding_dalam')) classificationType = 'dinding_dalam';
        else if (rowId.includes('plafond')) classificationType = 'plafond';
        else if (rowId.includes('atap')) classificationType = 'atap';

        const options = MOCK_CLASSIFICATIONS[classificationType] || [];
        const selectedOption = options.find(opt => opt.id === state.classificationKey) || options[0];
        
        if (selectedOption) {
          totalHargaSatuan += selectedOption.harga || 0;
          totalHargaPersentase += ((selectedOption.harga || 0) * (state.percentage || 0)) / 100;
        }
      }
    });

    const percentageComparison = totalHargaSatuan > 0 
      ? (totalHargaPersentase / totalHargaSatuan) * 100 
      : 0;

    return { totalHargaSatuan, totalHargaPersentase, percentageComparison };
  };

  const totals = calculateTotals();

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">Uraian Pekerjaan</th>
            <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900 w-64">Klasifikasi Standar</th>
            <th scope="col" className="py-3.5 px-4 text-right text-sm font-semibold text-gray-900 w-32">Harga Satuan</th>
            <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900 w-40">Persentase Pembangunan</th>
            <th scope="col" className="py-3.5 px-4 text-right text-sm font-semibold text-gray-900 w-40">Harga Persentase</th>
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

          {/* Total Pengeluaran Row */}
          <tr className="bg-blue-50 border-t-2 border-blue-200">
            <td colSpan={2} className="py-4 px-4 text-sm font-bold text-blue-900 uppercase tracking-wider text-right">
              Total Pengeluaran
            </td>
            <td className="py-4 px-4 text-sm text-right font-bold text-blue-900">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totals.totalHargaSatuan)}
            </td>
            <td className="py-4 px-4 text-center">
              <div className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold text-sm">
                {totals.percentageComparison.toFixed(2)}%
              </div>
              <div className="text-xs text-blue-700 mt-1">Efisiensi Anggaran</div>
            </td>
            <td className="py-4 px-4 text-sm text-right font-bold text-blue-900">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totals.totalHargaPersentase)}
            </td>
          </tr>

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