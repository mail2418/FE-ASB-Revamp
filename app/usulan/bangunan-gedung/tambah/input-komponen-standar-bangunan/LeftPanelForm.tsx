'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBuildingContext, get3DTypeFromKomponen } from './BuildingContext';

// Interface for API component data
interface StandardComponentAPI {
  id: number;
  komponen: string;
  idAsbJenis: number;
  idAsbTipeBangunan: number;
}

export default function LeftPanelForm() {
  const router = useRouter();
  const { formState, updateRowState } = useBuildingContext();
  
  // Load building data from localStorage
  const [buildingData, setBuildingData] = useState<any>(null);
  
  // API data states
  const [allComponents, setAllComponents] = useState<StandardComponentAPI[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<StandardComponentAPI[]>([]);
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
        console.log('Building Data:', parsed);

      } catch (e) {
        console.error('Failed to load building data:', e);
      }
    }
  }, []);
  // Fetch standard components from API - runs AFTER buildingData is loaded
  useEffect(() => {
    // Only fetch when buildingData is available
    if (!buildingData) return;
    const fetchStandardComponents = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const response = await fetch('/api/usulan/bangunan-gedung/kb-s', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const components = data.data?.komponenBangunans || data.data || [];
          
          // Filter components by jenis AND tipeBangunan from saved form data
          const filteredComponents = components.filter((c: any) =>
            c.idAsbJenis.toString() === buildingData.formData?.jenis &&
            c.idAsbTipeBangunan.toString() === buildingData.formData?.tipeBangunan
          );
          
          console.log('Filtered Components:', filteredComponents);
          console.log('Filter criteria - jenis:', buildingData.formData?.jenis, 'tipeBangunan:', buildingData.formData?.tipeBangunan);
          
          setAllComponents(filteredComponents);
          
          // Initialize component states for 3D visualization
          if (filteredComponents.length <= 10) {
            setSelectedComponents(filteredComponents);
          }
        }
      } catch (error) {
        console.error('Error fetching Standard Components:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStandardComponents();
  }, [buildingData]);

  // Fetch ASB By ID in order to gain Klasifikasi and SHST Value
  useEffect(()=>{
    const fetchASBById = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch(`/api/usulan/bangunan-gedung/asb/id?id=${buildingData?.resultASBfiltered?.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('ASB By ID:', data);
          
          const updatedResultASBfiltered = {
            ...buildingData?.resultASBfiltered,
            klasifikasi: data.data.asbKlasifikasi,
            shst: data.data.shst,
          };
          
          setBuildingData((prev: any) => ({
            ...prev,
            asb_shst_klasifikasi: updatedResultASBfiltered,
          }));
          
          // Update localStorage with the new klasifikasi and shst values
          const existingData = localStorage.getItem('usulan_bangunan_new_entry');
          if (existingData) {
            const parsedData = JSON.parse(existingData);
            parsedData.asb_shst_klasifikasi = updatedResultASBfiltered;
            localStorage.setItem('usulan_bangunan_new_entry', JSON.stringify(parsedData));
          }
        }
      } catch (error) {
        console.error('Error fetching ASB By ID:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchASBById();
  }, []);

  const handlePercentageChange = (componentId: number, componentKomponen: string, e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value) || 0;
    val = Math.max(0, Math.min(100, val));
    
    // Update by component ID (for saving)
    updateRowState(`row_${componentId}`, { percentage: val });
    
    // Also update by 3D type for visualization
    const type3D = get3DTypeFromKomponen(componentKomponen);
    if (type3D && type3D !== 'default') {
      updateRowState(`row_${type3D}`, { percentage: val });
    }
  };

  const toggleComponent = (component: StandardComponentAPI) => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
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

        console.log('id_asb', idAsb);

        // Build arrays for komponen_std and bobot_std
        const componentsToSave = needsDropdown ? selectedComponents : allComponents;
        const komponen_std: number[] = [];
        const bobot_std: number[] = [];

        componentsToSave.forEach((component) => {
          const state = formState[`row_${component.id}`];
          if (state?.percentage > 0) {
            komponen_std.push(component.id);
            bobot_std.push(state.percentage);
          }
        });

        // Prepare request body
        const requestBody = {
          id_asb: idAsb,
          id_asb_bipek_standard: null,
          komponen_std: komponen_std,
          bobot_std: bobot_std
        };

        // Send PUT request to API
        const response = await fetch('/api/usulan/bangunan-gedung/kb-s', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Gagal menyimpan data komponen standar');
        }

        // Send PUT request to Update Status of ASB 
        const responseUpdateStatus = await fetch('/api/usulan/bangunan-gedung/asb/store-bps', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!responseUpdateStatus.ok) {
          const errorData = await responseUpdateStatus.json().catch(() => ({}));
          throw new Error(errorData.message || 'Gagal menyimpan data komponen standar');
        }

        // Save state with selected components to localStorage
        const saveData = {
          formState,
          selectedComponents: componentsToSave
        };

        localStorage.setItem('usulan_bangunan_standar_components', JSON.stringify(saveData));
        // Navigate to next page
        router.push('/usulan/bangunan-gedung/tambah/input-komponen-non-standar-bangunan');
      } catch (error) {
        console.error('Error saving standard components:', error);
        alert(`Gagal menyimpan data: ${error instanceof Error ? error.message : 'Terjadi kesalahan'}`);
      } finally {
        setIsSubmitting(false);
      }
    }

  return (
    <div className="space-y-4">
      {/* Building Information Section */}
      {buildingData && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
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
                {buildingData.asb_shst_klasifikasi?.klasifikasi || '[Belum terklasifikasi]'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nilai SHST</p>
              <p className="text-base font-semibold text-blue-600">
                {buildingData.resultASBfiltered?.shst 
                  ? `Rp ${Number(buildingData.resultASBfiltered.shst).toLocaleString('id-ID')} / m²`
                  : buildingData.formData?.nilaiSHST || '[Belum terkalkulasi]'}
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
              Pilih Komponen Standar ({selectedComponents.length} dipilih)
            </h3>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Memuat komponen...</span>
        </div>
      )}

      {/* Table Section */}
      {!loading && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-5 px-8 text-left text-lg font-semibold text-gray-900">Uraian Pekerjaan</th>
                <th scope="col" className="py-5 px-8 text-left text-lg font-semibold text-gray-900">Persentase Pembangunan (Bobot)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(needsDropdown ? selectedComponents : allComponents).length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-8 text-center text-gray-500">
                    {needsDropdown ? 'Pilih komponen untuk ditampilkan' : 'Tidak ada komponen tersedia'}
                  </td>
                </tr>
              ) : (
                (needsDropdown ? selectedComponents : allComponents).map((component) => {
                  const currentState = formState[`row_${component.id}`];
                  console.log(currentState);
                  
                  return (
                    <tr key={component.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-5 px-8 text-lg font-medium text-gray-900">
                        {component.komponen}
                      </td>
                      <td className="py-4 px-8">
                        <div className="flex items-center gap-8">
                          <div className="flex items-center w-40">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg p-3 border text-right pr-10"
                              value={currentState?.percentage || 0}
                              onChange={(e) => handlePercentageChange(component.id, component.komponen, e)}
                            />
                            <span className="text-gray-500 text-lg -ml-9 pointer-events-none">%</span>
                          </div>
                          {/* Visual percentage bar */}
                          <div className="flex-1 bg-gray-200 rounded-full h-4">
                            <div 
                              className="bg-blue-600 h-4 rounded-full transition-all duration-500" 
                              style={{ width: `${currentState?.percentage || 0}%` }}
                            />
                          </div>
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
              onClick={() => router.push('/usulan/bangunan-gedung/tambah')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium flex items-center gap-2 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Previous
            </button>
            <button
              onClick={(e:any)=>handleSubmit(e)}
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