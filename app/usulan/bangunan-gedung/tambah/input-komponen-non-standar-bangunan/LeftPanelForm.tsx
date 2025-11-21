'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useBuildingContext } from './BuildingContext';

// Component definitions based on the image
const nonStandardComponents = [
  {
    id: 'row_pondasi',
    name: 'Pondasi',
    description: 'Untuk menopang dan menyalurkan beban bangunan ke dalam tanah. Hanya untuk pondasi dangkal yang terdiri atas pondasi plat dan sloof'
  },
  {
    id: 'row_struktur',
    name: 'Struktur',
    description: 'Kerangka Bangunan Gedung agar tidak mudah roboh. Terdiri atas : Kolom, balok, plat, ringbalk bangunan'
  },
  {
    id: 'row_lantai',
    name: 'Lantai',
    description: 'Penutup lantai bangunan, umumnya terdiri atas keramik, HT, Granit, dan finishingnya'
  },
  {
    id: 'row_dinding',
    name: 'Dinding',
    description: 'Sekat Bangunan yang terdiri atas dinding bata/partisi, plesteran, kaca, pintu, kusen'
  },
  {
    id: 'row_atap',
    name: 'Atap',
    description: 'Penutup bangunan gedung dari cuaca, terdiri atas rangka atap dan penutup atap (genteng)'
  },
  {
    id: 'row_utilitas',
    name: 'Utilitas',
    description: 'Sistem elektrikal dan drainase bangunan, terdiri atas instalsi listrik, instalasi air, dan drainase limbah (plumbing)'
  },
  {
    id: 'row_finishing',
    name: 'Finishing',
    description: 'Sentuhan akhir bangunan gedung, cat struktur, cat langit-langit, cat dinding, cat pintu'
  },
];

export default function LeftPanelForm() {
  const router = useRouter();
  const { formState, updateRowState } = useBuildingContext();

  const handlePercentageChange = (rowId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value) || 0;
    val = Math.max(0, Math.min(100, val));
    updateRowState(rowId, { percentage: val });
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="bg-lime-600 text-white px-4 py-3">
        <h2 className="font-semibold text-sm">Koefisien Standar Bangunan Gedung</h2>
      </div>

      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-lime-100">
          <tr>
            <th scope="col" className="py-3.5 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Klasifikasi Standar
            </th>
            <th scope="col" className="py-3.5 px-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
              Check
            </th>
            <th scope="col" className="py-3.5 px-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-40">
              Prosentase Pembangunan
            </th>
            <th scope="col" className="py-3.5 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Deskripsi Aktivitas
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {nonStandardComponents.map((component) => {
            const currentState = formState[component.id];

            return (
              <tr key={component.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                  {component.name}
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-800 flex items-center justify-center bg-white">
                      <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-gray-600">0% - </span>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-right pr-7"
                        value={currentState?.percentage || 0}
                        onChange={(e) => handlePercentageChange(component.id, e)}
                      />
                      <span className="text-gray-500 -ml-6 text-sm">%</span>
                    </div>
                  </div>
                  {/* Visual percentage bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-lime-600 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${currentState?.percentage || 0}%` }}
                    />
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {component.description}
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
