'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, FileText, CheckCircle2, MapPin, Layers, FileDown } from 'lucide-react';

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
  kodeRekening: string;
  deskripsiBangunan: string;
  luasTanah: string;
  jumlahLantai: string;
}

interface FloorData {
  id: string;
  jenisLantai: string;
  luas: string;
  fungsiLantai: string;
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

export default function SummaryPage() {
  const router = useRouter();
  const [basicData, setBasicData] = useState<BasicFormData | null>(null);
  const [floors, setFloors] = useState<FloorData[]>([]);
  const [standardComponents, setStandardComponents] = useState<{ [key: string]: ComponentState }>({});
  const [selectedStandardComponents, setSelectedStandardComponents] = useState<ComponentAPI[]>([]);
  const [nonStandardComponents, setNonStandardComponents] = useState<{ [key: string]: ComponentState }>({});
  const [selectedNonStandardComponents, setSelectedNonStandardComponents] = useState<ComponentAPI[]>([]);
  const [generatedPdfPath, setGeneratedPdfPath] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string>('');

  useEffect(() => {
    // Load all data from localStorage
    const savedBasic = localStorage.getItem('usulan_bangunan_new_entry');
    const savedStandard = localStorage.getItem('usulan_bangunan_standar_components');
    const savedNonStandard = localStorage.getItem('usulan_bangunan_nonstandar_components');

    if (savedBasic) {
      try {
        const parsed = JSON.parse(savedBasic);
        setBasicData(parsed.formData || null);
        setFloors(parsed.floors || []);
        console.log('Loaded basic data:', parsed);
      } catch (e) {
        console.error('Failed to parse basic data', e);
      }
    }

    if (savedStandard) {
      try {
        const parsed: SavedComponentData = JSON.parse(savedStandard);
        // Handle both new format (with formState and selectedComponents) and old format
        if (parsed.formState) {
          setStandardComponents(parsed.formState);
          setSelectedStandardComponents(parsed.selectedComponents || []);
        } else {
          // Old format - just formState directly
          setStandardComponents(parsed as any);
        }
        console.log('Loaded standard components:', parsed);
      } catch (e) {
        console.error('Failed to parse standard components', e);
      }
    }

    if (savedNonStandard) {
      try {
        const parsed: SavedComponentData = JSON.parse(savedNonStandard);
        // Handle both new format (with formState and selectedComponents) and old format
        if (parsed.formState) {
          setNonStandardComponents(parsed.formState);
          setSelectedNonStandardComponents(parsed.selectedComponents || []);
        } else {
          // Old format - just formState directly
          setNonStandardComponents(parsed as any);
        }
        console.log('Loaded non-standard components:', parsed);
      } catch (e) {
        console.error('Failed to parse non-standard components', e);
      }
    }
  }, []);

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

  const handleGeneratePDF = async () => {

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setIsGeneratingPdf(true);
    setPdfError('');

    try {
      const response = await fetch('/api/generate-surat-permohonan', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Gagal generate PDF');
      }

      const data = await response.json();
      setGeneratedPdfPath(data.filePath);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setPdfError('Gagal membuat Surat Permohonan. Silakan coba lagi.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleVerify = async () => {
      // Clear form data after successful submission
      localStorage.removeItem('usulan_bangunan_new_entry');
      localStorage.removeItem('usulan_bangunan_standar_components');
      localStorage.removeItem('usulan_bangunan_nonstandar_components');
      // Show success message
      alert('Data berhasil diverifikasi dan disimpan!');
      // Navigate back to usulan list
      router.push('/usulan/bangunan-gedung');
    }
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
                  {basicData?.tipeBangunan || 'Gedung Negara Tidak Sederhana'}
                </div>
                <div className="text-sm text-gray-600 text-center">
                  Jenis: <span className="font-medium">{basicData?.jenis || '-'}</span>
                </div>
              </div>
            </div>

            {/* Financial Info Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Nilai SHST per (m²)</label>
                  <div className="bg-lime-100 text-lime-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                    Rp 5.600.000 / m²
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Luas Total Bangunan</label>
                  <div className="bg-lime-100 text-lime-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                    {totalArea.toFixed(0)} m²
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Luas Tanah</label>
                  <div className="bg-lime-100 text-lime-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                    {basicData?.luasTanah || '0'} m²
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
                    {basicData?.kodeRekening || '1.01.012.15.0001'}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Kabupaten/Kota</label>
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                    {basicData?.kabKota || '-'}
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
                        <td className="px-4 py-3 text-sm text-gray-700">{floor.fungsiLantai}</td>
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

            {/* PDF Generation & Verify Buttons */}
            <div className="space-y-4">
              {/* Generate PDF Button */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <FileDown className="w-6 h-6 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Surat Permohonan</h3>
                </div>
                
                {generatedPdfPath ? (
                  <div className="space-y-3">
                    <div className="bg-green-100 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">Surat Permohonan telah dibuat</span>
                    </div>
                    <a
                      href={generatedPdfPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 text-orange-600 hover:text-orange-700 font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      Lihat PDF
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Generate Surat Permohonan sebelum melakukan verifikasi
                    </p>
                    <button
                      onClick={handleGeneratePDF}
                      disabled={isGeneratingPdf || !basicData}
                      className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isGeneratingPdf ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileDown className="w-5 h-5" />
                          Generate Surat Permohonan
                        </>
                      )}
                    </button>
                    {pdfError && (
                      <p className="text-sm text-red-600">{pdfError}</p>
                    )}
                  </div>
                )}
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
                    onClick={handleVerify}
                    disabled={!generatedPdfPath}
                    className="flex items-center gap-2 px-8 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all shadow-lg hover:shadow-xl font-semibold text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Verifikasi Sekarang
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
