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
              Prosentase
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
                    <div className="w-7 h-7 rounded-full border-2 border-gray-800 flex items-center justify-center bg-white">
                      <svg className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-gray-600">0% - </span>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lime-500 text-right pr-7"
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
                      style={{ width: `${currentState?.percentage || 0}%` }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
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
