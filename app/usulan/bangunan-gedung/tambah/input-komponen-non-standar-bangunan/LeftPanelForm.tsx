'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNonStandardBuildingContext } from './BuildingContext';

// Interface for API component data
interface NonStandardComponentAPI {
  id: number;
  komponen: string;
  idAsbJenis: number;
  idAsbTipeBangunan: number;
}

export default function LeftPanelForm() {
  const router = useRouter();
  const { formState, updateRowState } = useNonStandardBuildingContext();
  
  // Load building data from localStorage
  const [buildingData, setBuildingData] = useState<any>(null);
  
  // API data states
  const [allComponents, setAllComponents] = useState<NonStandardComponentAPI[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<NonStandardComponentAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load building data from localStorage first
  useEffect(() => {
    const savedData = localStorage.getItem('usulan_bangunan_new_entry');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setBuildingData(parsed);
      } catch (e) {
        console.error('Failed to load building data:', e);
      }
    }
  }, []);

  // Fetch non-standard components from API - runs AFTER buildingData is loaded
  useEffect(() => {
    // Only fetch when buildingData is available
    if (!buildingData) return;
    
    const fetchNonStandardComponents = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        
        const response = await fetch('/api/usulan/bangunan-gedung/kb-ns', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const components = data.data?.komponenBangunanNonstds || data.data || [];
          
          setAllComponents(components);
          
          // If 10 or less, auto-select all
          if (components.length <= 10) {
            setSelectedComponents(components);
          }
        }
      } catch (error) {
        console.error('Error fetching Non-Standard Components:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNonStandardComponents();
  }, [buildingData]); // Re-run when buildingData changes

  console.log(buildingData)

  // Fetch ASB By ID in order to gain Klasifikasi and SHST Value
  useEffect(() => {
    // Only run if buildingData exists and has resultASBfiltered
    if (!buildingData?.resultASBfiltered?.id) return;

    const fetchASBById = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        
        const response = await fetch(`/api/usulan/bangunan-gedung/asb/id?id=${buildingData.resultASBfiltered.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log(response)
        if (response.ok) {
          const data = await response.json();
          
          // Update buildingData with klasifikasi and shst from API
          if (data.data) {
            setBuildingData((prev: any) => ({
              ...prev,
              resultASBfiltered: {
                ...prev.resultASBfiltered,
                klasifikasi: data.data.klasifikasi,
                shst: data.data.shst,
              },
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching ASB By ID:', error);
      }
    };
    
    fetchASBById();
  }, [buildingData?.resultASBfiltered?.id]); // Only re-run when the ID changes
  
  console.log(buildingData)

  const handlePercentageChange = (componentId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value) || 0;
    val = Math.max(0, Math.min(100, val));
    // Automatically set checked to true when percentage > 0
    updateRowState(`row_${componentId}`, { 
      percentage: val,
      checked: val > 0 
    });
  };

  const toggleComponent = (component: NonStandardComponentAPI) => {
    if (selectedComponents.find(c => c.id === component.id)) {
      setSelectedComponents(selectedComponents.filter(c => c.id !== component.id));
    } else {
      setSelectedComponents([...selectedComponents, component]);
    }
  };

  const filteredComponents = allComponents.filter(c => 
    c.komponen.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const needsDropdown = allComponents.length > 10;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        return;
      }

      // Get id_asb from localStorage
      const idAsb = buildingData?.resultASBfiltered?.id;
      if (!idAsb) {
        console.error('No id_asb found in localStorage');
      }

      // Build arrays for komponen_nonstd and bobot_nonstd (only checked items)
      const componentsToSave = needsDropdown ? selectedComponents : allComponents;
      const komponen_nonstd: number[] = [];
      const bobot_nonstd: number[] = [];

      componentsToSave.forEach((component) => {
        const state = formState[`row_${component.id}`];
        if (state?.percentage > 0) {
          komponen_nonstd.push(component.id);
          bobot_nonstd.push(state.percentage);
        }
      });

      // Prepare request body
      const requestBody = {
        id_asb: idAsb,
        id_asb_bipek_nonstd: null,
        komponen_nonstd: komponen_nonstd,
        bobot_nonstd: bobot_nonstd
      };

      console.log('Sending non-standard components:', requestBody);

      // Send PUT request to API
      const response = await fetch('/api/superadmin/kb-ns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal menyimpan data komponen non-standar');
      }

      // Send PUT request to Update Status of ASB 
      const responseUpdateStatus = await fetch('/api/usulan/bangunan-gedung/asb/store-bpns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!responseUpdateStatus.ok) {
        const errorData = await responseUpdateStatus.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal menyimpan data komponen non-standar');
      }

      const result = await response.json();
      console.log('Non-standard components saved:', result);

      // Save state with selected components to localStorage
      const saveData = {
        formState,
        selectedComponents: componentsToSave
      };
      localStorage.setItem('usulan_bangunan_nonstandar_components', JSON.stringify(saveData));

      // Navigate to summary page
      router.push('/usulan/bangunan-gedung/tambah/summary');
    } catch (error) {
      console.error('Error saving non-standard components:', error);
      alert(`Gagal menyimpan data: ${error instanceof Error ? error.message : 'Terjadi kesalahan'}`);
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <div className="space-y-4">
      {/* Building Information Section */}
      {buildingData && (
        <div className="bg-gradient-to-r from-lime-50 to-green-50 rounded-lg border border-lime-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Informasi Bangunan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nama Bangunan</p>
              <p className="text-base font-semibold text-gray-900">
                {buildingData.formData?.deskripsiBangunan || '-'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Klasifikasi Bangunan</p>
              <p className="text-base font-semibold text-gray-900">
                {buildingData.asb_shst_klasifikasi?.klasifikasi?.klasifikasi ||'[Belum terklasifikasi]'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nilai SHST</p>
              <p className="text-base font-semibold text-lime-600">
                {buildingData.asb_shst_klasifikasi?.shst
                  ? `Rp ${Number(buildingData.asb_shst_klasifikasi.shst).toLocaleString('id-ID')} / m²`
                  : '0'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Component Selection Dropdown (if more than 10 components) */}
      {needsDropdown && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              Pilih Komponen Non Standar ({selectedComponents.length} dipilih)
            </h3>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-colors text-sm font-medium"
            >
              {showDropdown ? 'Tutup' : 'Pilih Komponen'}
            </button>
          </div>
          
          {showDropdown && (
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              {/* Search input */}
              <input
                type="text"
                placeholder="Cari komponen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
              
              {/* Component list with checkboxes */}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredComponents.map((component) => (
                  <label
                    key={component.id}
                    className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedComponents.some(c => c.id === component.id)}
                      onChange={() => toggleComponent(component)}
                      className="w-5 h-5 text-lime-600 rounded border-gray-300 focus:ring-lime-500"
                    />
                    <span className="text-gray-800">{component.komponen}</span>
                  </label>
                ))}
              </div>
              
              {/* Quick actions */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => setSelectedComponents([...allComponents])}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Pilih Semua
                </button>
                <button
                  onClick={() => setSelectedComponents([])}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Hapus Semua
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600"></div>
          <span className="ml-2 text-gray-600">Memuat komponen...</span>
        </div>
      )}

      {/* Table Section */}
      {!loading && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          {/* Header */}
          <div className="bg-lime-600 text-white px-8 py-5">
            <h2 className="font-semibold text-lg">Komponen Non Standar Bangunan Gedung</h2>
          </div>

          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-lime-100">
              <tr>
                <th scope="col" className="py-5 px-8 text-left text-base font-semibold text-gray-700 uppercase tracking-wider">
                  No
                </th>
                <th scope="col" className="py-5 px-8 text-left text-base font-semibold text-gray-700 uppercase tracking-wider">
                  Komponen Non Standar
                </th>
                <th scope="col" className="py-5 px-8 text-center text-base font-semibold text-gray-700 uppercase tracking-wider">
                  Bobot (%)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(needsDropdown ? selectedComponents : allComponents).length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-500">
                    {needsDropdown ? 'Pilih komponen untuk ditampilkan' : 'Tidak ada komponen tersedia'}
                  </td>
                </tr>
              ) : (
                (needsDropdown ? selectedComponents : allComponents).map((component, index) => {
                  const currentState = formState[`row_${component.id}`];
                  return (
                    <tr key={component.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-5 text-lg text-gray-700 text-center">
                        {index + 1}
                      </td>
                      <td className="px-8 py-5 text-lg font-medium text-gray-900">
                        {component.komponen}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center gap-6">
                          <div className="flex items-center w-40">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="w-full px-4 py-2.5 text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lime-500 text-right pr-10"
                              value={currentState?.percentage || 0}
                              onChange={(e) => handlePercentageChange(component.id, e)}
                            />
                            <span className="text-gray-500 text-lg -ml-9 pointer-events-none">%</span>
                          </div>
                        </div>
                        {/* Visual percentage bar */}
                        <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                          <div 
                            className="bg-lime-600 h-3 rounded-full transition-all duration-300" 
                            style={{ width: `${currentState?.percentage || 0}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
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
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Menyimpan...
                </>
              ) : (
                <>
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
