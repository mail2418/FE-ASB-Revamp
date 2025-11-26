'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useNonStandardBuildingContext } from './BuildingContext';

// Component definitions - 21 non-standard components
const nonStandardComponents = [
  { id: 'row_alat_pengkondisi_udara', name: 'Alat Pengkondisi Udara' },
  { id: 'row_elevator_escalator', name: 'Elevator/Escalator' },
  { id: 'row_tata_suara', name: 'Tata Suara (Sound System)' },
  { id: 'row_telepon_pabx', name: 'Telepon/PABX' },
  { id: 'row_instalasi_it', name: 'Instalasi IT (Informasi dan Teknologi)' },
  { id: 'row_elektrikal', name: 'Elektrikal' },
  { id: 'row_sistem_proteksi_kebakaran', name: 'Sistem Proteksi Kebakaran' },
  { id: 'row_penangkal_petir_khusus', name: 'Penangkal Petir Khusus' },
  { id: 'row_ipal', name: 'IPAL' },
  { id: 'row_interior_furniture', name: 'Interior (dan Furniture)' },
  { id: 'row_gas_pembakaran', name: 'Gas Pembakaran' },
  { id: 'row_gas_medis', name: 'Gas Medis' },
  { id: 'row_pencegahan_bahaya_rayap', name: 'Pencegahan Bahaya Rayap' },
  { id: 'row_pondasi_dalam', name: 'Pondasi Dalam' },
  { id: 'row_fasilitas_disabilitas', name: 'Fasilitas Penyandang Disabilitas' },
  { id: 'row_sarana_prasarana_lingkungan', name: 'Sarana dan Prasarana Lingkungan' },
  { id: 'row_peningkatan_mutu', name: 'Peningkatan Mutu' },
  { id: 'row_perizinan_selain_imb', name: 'Perizinan selain IMB' },
  { id: 'row_penyiapan_pematangan_lahan', name: 'Penyiapan Pematangan Lahan' },
  { id: 'row_bangunan_gedung_hijau', name: 'Pemenuhan Persyaratan Bangunan Gedung Hijau' },
  { id: 'row_penyambungan_utilitas', name: 'Penyambungan Utilitas' },
];

export default function LeftPanelForm() {
  const router = useRouter();
  const { formState, updateRowState } = useNonStandardBuildingContext();

  const handlePercentageChange = (rowId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value) || 0;
    val = Math.max(0, Math.min(100, val));
    updateRowState(rowId, { percentage: val });
  };

  const handleCheckChange = (rowId: string, checked: boolean) => {
    updateRowState(rowId, { 
      checked: checked,
      // Reset percentage to 0 when unchecking
      percentage: checked ? (formState[rowId]?.percentage || 0) : 0
    });
  };

  // Calculate totals for non-standard components
  const calculateTotals = () => {
    let checkedCount = 0;
    let totalPercentage = 0;

    Object.values(formState).forEach((state: any) => {
      if (state?.checked) {
        checkedCount++;
        totalPercentage += state.percentage || 0;
      }
    });

    const averagePercentage = checkedCount > 0 ? totalPercentage / checkedCount : 0;

    return { checkedCount, totalPercentage, averagePercentage };
  };

  const totals = calculateTotals();

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="bg-lime-600 text-white px-4 py-3">
        <h2 className="font-semibold text-sm">Komponen Non Standar Bangunan Gedung</h2>
      </div>

      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-lime-100">
          <tr>
            <th scope="col" className="py-3.5 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              No
            </th>
            <th scope="col" className="py-3.5 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Komponen Non Standar
            </th>
            <th scope="col" className="py-3.5 px-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
              Check
            </th>
            <th scope="col" className="py-3.5 px-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-48">
              Persentase
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {nonStandardComponents.map((component, index) => {
            const currentState = formState[component.id];
            return (
              <tr key={component.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-700 text-center">
                  {index + 1}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {component.name}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center">
                    <label className="cursor-pointer">
                      <input
                        type="checkbox"
                        className="peer hidden"
                        checked={currentState?.checked || false}
                        onChange={(e) => handleCheckChange(component.id, e.target.checked)}
                      />
                      <div className="w-7 h-7 rounded-full border-2 peer-checked:border-lime-600 peer-checked:bg-lime-600 border-gray-300 flex items-center justify-center bg-white transition-all duration-200 hover:border-lime-400">
                        <svg className="w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </label>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex w-full items-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        disabled={!currentState?.checked}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lime-500 text-right pr-7 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                        value={currentState?.percentage || 0}
                        onChange={(e) => handlePercentageChange(component.id, e)}
                      />
                      <span className="text-gray-500 -ml-6 text-sm pointer-events-none">%</span>
                    </div>
                  </div>
                  {/* Visual percentage bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-lime-600 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${currentState?.checked ? (currentState?.percentage || 0) : 0}%` }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
          
          {/* Total Pengeluaran Row */}
          <tr className="bg-lime-50 border-t-2 border-lime-300">
            <td colSpan={2} className="py-4 px-4 text-sm font-bold text-lime-900 uppercase tracking-wider text-right">
              Total Komponen Terpilih
            </td>
            <td className="py-4 px-4 text-center">
              <div className="bg-lime-600 text-white px-3 py-2 rounded-lg font-bold">
                {totals.checkedCount}
              </div>
            </td>
            <td className="py-4 px-4 text-center">
              <div className="space-y-1">
                <div className="bg-lime-600 text-white px-3 py-2 rounded-lg font-bold">
                  {totals.averagePercentage.toFixed(2)}%
                </div>
                <div className="text-xs text-lime-700">Rata-rata Persentase</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Navigation Buttons */}
      <div className="flex justify-between p-6 bg-gray-50 border-t border-gray-200">
        <button
          onClick={() => router.push('/usulan/bangunan-gedung/tambah/input-komponen-standar-bangunan')}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium flex items-center gap-2 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Previous
        </button>
        <button
          onClick={() => {
            // Save state
            localStorage.setItem('usulan_bangunan_nonstandar_components', JSON.stringify(formState));
            // Navigate to summary page (placeholder for now)
            router.push('/usulan/bangunan-gedung/tambah/summary');
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
