'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, FileText, CheckCircle2, MapPin, Layers, FileDown, DollarSign } from 'lucide-react';

// Interface for API component data
interface ComponentAPI {
  id: number;
  komponen: string;
  idAsbJenis?: number;
  idAsbTipeBangunan?: number;
}

interface BasicFormData {
  jenis: string;
  tipeBangunan: string;
  namaBangunan: string;
  lokasi: string;
  kabKota: string;
  kabKotaNama?: string;
  kecamatan: string;
  kecamatanNama?: string;
  kelurahan: string;
  kelurahanNama?: string;
  RekeningBelanja: {
    id: Number,
    kodeRekeningBelanja: string,
    namaRekeningBelanja: string
  };
  deskripsiBangunan: string;
  luasTanah: string;
  jumlahLantai: string;
  resultASBfiltered?: {
    id?: number;
    klasifikasi?: string;
    shst?: number;
    [key: string]: any;
  };
}

interface FloorData {
  id: string;
  jenisLantai: string;
  luas: string;
  fungsiLantai: string;
  namaFungsiLantai: string;
  fungsiRuangId?: string;
}

interface ComponentState {
  percentage: number;
  checked?: boolean;
}

interface SavedComponentData {
  formState: { [key: string]: ComponentState };
  selectedComponents: ComponentAPI[];
}

interface KlasifikasiSHST {
  klasifikasi: string;
  shst: number;
}

interface resultASBfiltered {
  id: number;
}

// Interface for ASB API data
interface ASBApiData {
  id: number;
  namaAsb: string;
  alamat: string;
  shst: number | null;
  nominalBps: string | null;
  nominalBpns: string | null;
  totalLantai: number;
  luasTanah: number | null;
  luasTotalBangunan: number | null;
  asbKlasifikasi: {
    id: number;
    klasifikasi: string;
  } | null;
  asbJenis: {
    id: number;
    jenis: string;
  } | null;
  asbTipeBangunan: {
    id: number;
    tipe_bangunan: string;
  } | null;
  kabkota: {
    id: number;
    nama: string;
  } | null;
  rekening: {
    id: number;
    rekening_kode: string;
    rekening_uraian: string;
  } | null;
  asbDetails: any[];
  asbBipekStandards: any[];
  asbBipekNonStds: any[];
}

export default function SummaryPage() {
  const router = useRouter();
  const [basicData, setBasicData] = useState<BasicFormData | null>(null);
  const [klasifikasiSHST, setKlasifikasiSHST] = useState<KlasifikasiSHST | null>(null);
  const [resultASBfiltered, setResultASBfiltered] = useState<resultASBfiltered | null>(null);
  const [floors, setFloors] = useState<FloorData[]>([]);
  const [standardComponents, setStandardComponents] = useState<{ [key: string]: ComponentState }>({});
  const [selectedStandardComponents, setSelectedStandardComponents] = useState<ComponentAPI[]>([]);
  const [nonStandardComponents, setNonStandardComponents] = useState<{ [key: string]: ComponentState }>({});
  const [selectedNonStandardComponents, setSelectedNonStandardComponents] = useState<ComponentAPI[]>([]);
  const [asbData, setAsbData] = useState<ASBApiData | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Load from localStorage first
  useEffect(() => {
    const savedBasic = localStorage.getItem('usulan_bangunan_new_entry');
    const savedStandard = localStorage.getItem('usulan_bangunan_standar_components');
    const savedNonStandard = localStorage.getItem('usulan_bangunan_nonstandar_components');

    if (savedBasic) {
      try {
        const parsed = JSON.parse(savedBasic);
        setBasicData(parsed.formData || null);
        setKlasifikasiSHST(parsed.klasifikasiSHST || null);
        setResultASBfiltered(parsed.resultASBfiltered || null);
        setFloors(parsed.floors || []);
        console.log('Loaded basic data:', parsed);
      } catch (e) {
        console.error('Failed to parse basic data', e);
      }
    }

    if (savedStandard) {
      try {
        const parsed: SavedComponentData = JSON.parse(savedStandard);
        if (parsed.formState) {
          setStandardComponents(parsed.formState);
          setSelectedStandardComponents(parsed.selectedComponents || []);
        } else {
          setStandardComponents(parsed as any);
        }
      } catch (e) {
        console.error('Failed to parse standard components', e);
      }
    }

    if (savedNonStandard) {
      try {
        const parsed: SavedComponentData = JSON.parse(savedNonStandard);
        if (parsed.formState) {
          setNonStandardComponents(parsed.formState);
          setSelectedNonStandardComponents(parsed.selectedComponents || []);
        } else {
          setNonStandardComponents(parsed as any);
        }
      } catch (e) {
        console.error('Failed to parse non-standard components', e);
      }
    }
  }, []);

  // Fetch ASB by ID after we have resultASBfiltered
  useEffect(() => {
    const fetchASBById = async () => {
      if (!resultASBfiltered?.id) return;
      
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch(`/api/usulan/bangunan-gedung/asb/id?id=${resultASBfiltered.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          const data = result.data;
          console.log('ASB By ID (Tambah Summary):', data);
          setAsbData(data);
          
          // Update klasifikasiSHST from API data if not already set
          if ((data.asbKlasifikasi || data.shst) && !klasifikasiSHST?.klasifikasi) {
            setKlasifikasiSHST({
              klasifikasi: data.asbKlasifikasi?.klasifikasi || '',
              shst: data.shst || 0
            });
          }
        }
      } catch (error) {
        console.error('Error fetching ASB By ID:', error);
      }
    };

    fetchASBById();
  }, [resultASBfiltered?.id]);

  // Calculate totals
  const totalArea = floors.reduce((sum, floor) => sum + (parseFloat(floor.luas) || 0), 0);

  // Get component name by ID
  const getComponentName = (rowKey: string, components: ComponentAPI[]) => {
    const match = rowKey.match(/^row_(\d+)$/);
    if (match) {
      const id = parseInt(match[1]);
      const component = components.find(c => c.id === id);
      return component?.komponen || rowKey.replace('row_', '').replace(/_/g, ' ');
    }
    return rowKey.replace('row_', '').replace(/_/g, ' ');
  };

  const handleVerify = async () => {
    try{
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const requestBody = {
        id_asb: resultASBfiltered?.id
      }
      console.log(requestBody);
      const response = await fetch('/api/usulan/bangunan-gedung/asb/store-verif', {
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

      const result = await response.json();
      console.log('Non-standard components saved:', result);

      // Clear form data after successful submission
      localStorage.removeItem('usulan_bangunan_new_entry');
      localStorage.removeItem('usulan_bangunan_standar_components');
      localStorage.removeItem('usulan_bangunan_nonstandar_components');
      // Show success message
      alert('Data berhasil diverifikasi dan disimpan!');
      // Navigate back to usulan list
      router.push('/usulan/bangunan-gedung');
    }catch(error){
      console.error('Error verifying data:', error);
    }
  };
  // Get filtered standard components with percentages
  const getStandardComponentsDisplay = () => {
    if (selectedStandardComponents.length > 0) {
      return selectedStandardComponents.map(comp => ({
        name: comp.komponen,
        percentage: standardComponents[`row_${comp.id}`]?.percentage || 0,
      })).filter(comp => comp.percentage > 0);
    }
    // Fallback to showing all formState entries
    return Object.entries(standardComponents)
      .filter(([_, value]) => value?.percentage > 0)
      .map(([key, value]) => ({
        name: getComponentName(key, selectedStandardComponents),
        percentage: value?.percentage || 0,
      }));
  };

  // Get filtered non-standard components with percentages (only checked)
  const getNonStandardComponentsDisplay = () => {
    if (selectedNonStandardComponents.length > 0) {
      return selectedNonStandardComponents.map(comp => ({
        name: comp.komponen,
        percentage: nonStandardComponents[`row_${comp.id}`]?.percentage || 0,
        checked: nonStandardComponents[`row_${comp.id}`]?.checked || false,
      })).filter(comp => comp.checked && comp.percentage > 0);
    }
    // Fallback to showing all formState entries
    return Object.entries(nonStandardComponents)
      .filter(([_, value]) => value?.checked && value?.percentage > 0)
      .map(([key, value]) => ({
        name: getComponentName(key, selectedNonStandardComponents),
        percentage: value?.percentage || 0,
        checked: value?.checked || false,
      }));
  };

  const standardDisplay = getStandardComponentsDisplay();
  const nonStandardDisplay = getNonStandardComponentsDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Summary Executive</h1>
          <p className="text-gray-600">Ringkasan lengkap usulan bangunan gedung</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Classification Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-6 h-6 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">Klasifikasi</h2>
              </div>
              <div className="space-y-3">
                <div className="bg-lime-100 text-lime-800 px-4 py-2 rounded-lg text-center font-medium">
                  {klasifikasiSHST?.klasifikasi ||'[Belum terklasifikasi]'}
                </div>
                <div className="text-sm text-gray-600 text-center">
                  Jenis Bangunan: <span className="font-medium">{basicData?.jenis == "1" ? "Pembangunan" : "Pemeliharaan"}</span>
                </div>
                <div className="text-sm text-gray-600 text-center">
                  Tipe Usulan: <span className="font-medium">{basicData?.tipeBangunan == "1" ? "Gedung negara" : "Rumah Negara"}</span>
                </div>
              </div>
            </div>
            

            {/* Financial Info Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">Informasi Keuangan</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Nilai SHST per (m²)</label>
                  <div className="bg-lime-100 text-lime-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                    Rp {asbData?.shst ? Number(asbData.shst).toLocaleString('id-ID') : (klasifikasiSHST?.shst ? Number(klasifikasiSHST.shst).toLocaleString('id-ID') : '0')} / m²
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Luas Total Bangunan</label>
                  <div className="bg-lime-100 text-lime-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                    {asbData?.luasTotalBangunan ? Number(asbData.luasTotalBangunan).toFixed(0) : totalArea.toFixed(0)} m²
                  </div>
                </div>

                {/* Only show Luas Tanah if tipeBangunan contains 'Rumah Negara' */}
                {(asbData?.asbTipeBangunan?.tipe_bangunan?.toLowerCase().includes('rumah negara') || basicData?.tipeBangunan?.toLowerCase().includes('rumah negara')) && (
                  <div>
                    <label className="text-sm text-gray-600">Luas Tanah</label>
                    <div className="bg-lime-100 text-lime-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                      {asbData?.luasTanah || basicData?.luasTanah || '0'} m²
                    </div>
                  </div>
                )}

                {/* Nominal BPS */}
                <div>
                  <label className="text-sm text-gray-600">Nominal BPS (Biaya Pekerjaan Standar)</label>
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                    Rp {asbData?.nominalBps ? Number(asbData.nominalBps).toLocaleString('id-ID') : '0'}
                  </div>
                </div>

                {/* Nominal BPNS */}
                <div>
                  <label className="text-sm text-gray-600">Nominal BPNS (Biaya Pekerjaan Non-Standar)</label>
                  <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                    Rp {asbData?.nominalBpns ? Number(asbData.nominalBpns).toLocaleString('id-ID') : '0'}
                  </div>
                </div>
              </div>
            </div>

            {/* Code & Budget Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Kode Rekening</label>
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-center font-mono mt-1">
                    {basicData?.RekeningBelanja.kodeRekeningBelanja || '-'}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Kabupaten/Kota</label>
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                    {basicData?.kabKotaNama || basicData?.kabKota || '-'}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Kecamatan</label>
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                    {basicData?.kecamatanNama || basicData?.kecamatan || '-'}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Kelurahan</label>
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                    {basicData?.kelurahanNama || basicData?.kelurahan || '-'}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Jumlah Lantai</label>
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                    {basicData?.jumlahLantai || floors.length} Lantai
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Building Info Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">Informasi Bangunan</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Deskripsi Bangunan</label>
                  <p className="text-gray-900 font-medium mt-1">{basicData?.deskripsiBangunan || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Lokasi</label>
                  <p className="text-gray-900 font-medium mt-1">{basicData?.lokasi || '-'}</p>
                </div>
              </div>
            </div>

            {/* Floors Table */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <Layers className="w-6 h-6 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">Detail Lantai ({floors.length} Lantai)</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Lantai</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Luas</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fungsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {floors.length > 0 ? floors.map((floor, index) => (
                      <tr key={floor.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{floor.jenisLantai}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{floor.luas} m²</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{floor.namaFungsiLantai}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                          Belum ada data lantai
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {floors.length > 0 && (
                    <tfoot className="bg-gray-50 border-t">
                      <tr>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">Total</td>
                        <td className="px-4 py-3 text-sm font-semibold text-teal-600">{totalArea.toFixed(0)} m²</td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* Components Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Standard Components */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="text-md font-semibold text-gray-900 mb-3">
                  Komponen Standar ({standardDisplay.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {standardDisplay.length > 0 ? standardDisplay.map((comp, index) => (
                    <div key={index} className="flex justify-between items-center text-sm py-1 border-b border-gray-100 last:border-0">
                      <span className="text-gray-600">{comp.name}</span>
                      <span className="font-semibold text-teal-600">{comp.percentage}%</span>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 text-center py-4">Belum ada komponen standar</p>
                  )}
                </div>
              </div>

              {/* Non-Standard Components */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="text-md font-semibold text-gray-900 mb-3">
                  Komponen Non-Standar ({nonStandardDisplay.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {nonStandardDisplay.length > 0 ? nonStandardDisplay.map((comp, index) => (
                    <div key={index} className="flex justify-between items-center text-sm py-1 border-b border-gray-100 last:border-0">
                      <span className="text-gray-600">{comp.name}</span>
                      <span className="font-semibold text-orange-600">{comp.percentage}%</span>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 text-center py-4">Tidak ada komponen non-standar dipilih</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center gap-4">
                {/* Previous Button */}
                <button
                  onClick={() => router.push('/usulan/bangunan-gedung/tambah/input-komponen-non-standar-bangunan')}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all font-semibold cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Previous
                </button>

                <div className="flex gap-3">
                  {/* Cancel Verification Button */}
                  <button
                    onClick={() => {
                      if (confirm('Apakah Anda yakin ingin membatalkan verifikasi? Semua data akan dikembalikan ke halaman dashboard.')) {
                        // Clear localStorage
                        localStorage.removeItem('usulan_bangunan_new_entry');
                        localStorage.removeItem('usulan_bangunan_standar_components');
                        localStorage.removeItem('usulan_bangunan_nonstandar_components');
                        // Navigate to dashboard
                        router.push('/usulan/bangunan-gedung');
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-all font-semibold cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel Verification
                  </button>

                  {/* Verify Button */}
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="flex items-center gap-2 px-8 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all shadow-lg hover:shadow-xl font-semibold text-lg cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Ajukan Permohonan
                  </button>
                </div>
              </div>
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-4 transform animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-amber-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-amber-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Konfirmasi Pengajuan</h3>
              <p className="text-gray-600 mb-6">
                <strong className="text-amber-600">Setelah mengajukan Permohonan Anda tidak dapat Mengedit.</strong>
                <br />
                <span className="text-sm">Pastikan semua data sudah benar sebelum melanjutkan.</span>
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    handleVerify();
                  }}
                  className="px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all font-medium flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Ya, Ajukan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
