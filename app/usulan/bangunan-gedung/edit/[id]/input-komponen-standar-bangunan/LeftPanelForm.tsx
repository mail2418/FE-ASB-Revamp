'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useEditBuildingContext, get3DTypeFromKomponen } from './BuildingContext';

// Interface for API component data
interface StandardComponentAPI {
  id: number;
  komponen: string;
  idAsbJenis: number;
  idAsbTipeBangunan: number;
}

export default function LeftPanelForm() {
  const router = useRouter();
  const params = useParams();
  const asbId = params.id as string;
  
  const { formState, updateRowState, setFormState } = useEditBuildingContext();
  
  // API data states
  const [allComponents, setAllComponents] = useState<StandardComponentAPI[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<StandardComponentAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buildingInfo, setBuildingInfo] = useState<any>(null);

  // Fetch existing data and components from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        // Fetch all standard components
        const componentsResponse = await fetch('/api/usulan/bangunan-gedung/kb-s', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (componentsResponse.ok) {
          const data = await componentsResponse.json();
          const components = data.data?.komponenBangunans || data.data || [];
          setAllComponents(components);
          
          // If 10 or less, auto-select all
          if (components.length <= 10) {
            setSelectedComponents(components);
          }
        }

        // TODO: Fetch existing ASB data by ID to pre-populate percentages
        // For now, we'll just load the components
        // You may need to create an API endpoint like /api/usulan/bangunan-gedung/asb/[id]
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [asbId]);

  const handlePercentageChange = (componentId: number, componentKomponen: string, e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value) || 0;
    val = Math.max(0, Math.min(100, val));
    
    updateRowState(`row_${componentId}`, { percentage: val });
    
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
        id_asb: parseInt(asbId),
        id_asb_bipek_standard: null,
        komponen_std: komponen_std,
        bobot_std: bobot_std
      };

      console.log('Updating standard components:', requestBody);

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

      const result = await response.json();
      console.log('Standard components updated:', result);

      // Save state with selected components to localStorage
      const saveData = {
        formState,
        selectedComponents: componentsToSave
      };

      localStorage.setItem('usulan_bangunan_standar_components', JSON.stringify(saveData));
      // Navigate to non-standard edit page
      router.push(`/usulan/bangunan-gedung/edit/${asbId}/input-komponen-non-standar-bangunan`);
    } catch (error) {
      console.error('Error updating standard components:', error);
      alert(`Gagal menyimpan data: ${error instanceof Error ? error.message : 'Terjadi kesalahan'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ASB ID Info */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200 p-4">
        <p className="text-sm text-orange-700">
          <strong>Mode Edit:</strong> ASB ID #{asbId}
        </p>
      </div>

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
              <input
                type="text"
                placeholder="Cari komponen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
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
              onClick={() => router.push('/usulan/bangunan-gedung')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium flex items-center gap-2 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Kembali
            </button>
            <button
              onClick={(e: any) => handleSubmit(e)}
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
