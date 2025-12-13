'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Route, ChevronRight, Save, ArrowLeft, Info } from 'lucide-react';

// Types for form data
interface FormData {
  jenisUsulan: 'Pemeliharaan' | 'Pembuatan' | '';
  lebarJalan: string;
  strukturPerkerasan: 'lentur' | 'kaku' | '';
  spesifikasiDesain: string;
  mutuBeton: string;
  ruangLingkup: string[];
  // Height inputs for layers (mm)
  tinggiPerkerasan: string;
  tinggiLapisPondasi: string;
  tinggiTimbunanTanah: string;
  tinggiGalianTanah: string;
  // Keterangan inputs
  keteranganGalianTanah: string;
  keteranganMarkaJalan: string;
  keteranganRambuPatok: string;
  keteranganTambahan: string;
}

// Options for form fields
const lebarJalanOptions = [
  { value: '3', label: 'Lebar 3 m' },
  { value: '4', label: 'Lebar 4 m' },
  { value: '5', label: 'Lebar 5 m' },
  { value: '7', label: 'Lebar 7 m' },
  { value: '10', label: 'Lebar 10 m' },
];

const spesifikasiDesainLentur = [
  { value: 'bagan_3', label: 'Bagan Desain 3 : Opsi Biaya Minimum dengan CTB' },
  { value: 'bagan_3a', label: 'Bagan Desain 3A : Opsi Biaya Minimum dengan HRS' },
  { value: 'bagan_3b', label: 'Bagan Desain 3B : Aspal dengan Lapis Fondasi Berbutir' },
  { value: 'bagan_3c', label: 'Bagan Desain 3C : Penyesuaian LPA pada Bagan Desain 3B untuk Tanah Dasar CBR ≥ 7%' },
];

const spesifikasiDesainKaku = [
  { value: 'bagan_4', label: 'Bagan Desain 4 : Perkerasan Kaku untuk Beban Lalu Lintas Berat' },
  { value: 'bagan_4a', label: 'Bagan Desain 4A : Perkerasan Kaku untuk Beban Lalu Lintas Ringan' },
];

const mutuBetonOptions = [
  { value: 'fc_20', label: "f'c 20 Mpa" },
  { value: 'fc_25', label: "f'c 25 Mpa" },
];

const ruangLingkupLentur = [
  { id: 'perkerasan_aspal', label: 'Perkerasan Aspal', hasHeight: true, unit: 'mm' },
  { id: 'lapis_pondasi', label: 'Lapis Pondasi', hasHeight: true, unit: 'mm' },
  { id: 'galian_tanah', label: 'Galian Tanah', hasHeight: true, unit: 'cm' },
  { id: 'timbunan_tanah', label: 'Timbunan Tanah', hasHeight: true, unit: 'mm' },
  { id: 'pemadatan_tanah', label: 'Pemadatan Tanah', hasHeight: false },
  { id: 'marka_jalan', label: 'Marka Jalan', hasHeight: true, unit: 'mm' },
  { id: 'rambu_patok', label: 'Rambu/Patok', hasHeight: true, unit: 'buah/km' },
  { id: 'median_jalan', label: 'Median Jalan', hasHeight: false },
];

const ruangLingkupKaku = [
  { id: 'perkerasan_beton', label: 'Perkerasan Beton', hasHeight: true, unit: 'mm' },
  { id: 'lapis_pondasi', label: 'Lapis Pondasi', hasHeight: true, unit: 'mm' },
  { id: 'galian_tanah', label: 'Galian Tanah', hasHeight: true, unit: 'cm' },
  { id: 'timbunan_tanah', label: 'Timbunan Tanah', hasHeight: true, unit: 'mm' },
  { id: 'pemadatan_tanah', label: 'Pemadatan Tanah', hasHeight: false },
  { id: 'marka_jalan', label: 'Marka Jalan', hasHeight: true, unit: 'mm' },
  { id: 'rambu_patok', label: 'Rambu/Patok', hasHeight: true, unit: 'buah/km' },
  { id: 'median_jalan', label: 'Median Jalan', hasHeight: false },
];

// 3D Road Visualization Component
const RoadVisualization = ({ 
  tinggiPerkerasan, 
  tinggiLapisPondasi, 
  tinggiTimbunanTanah, 
  tinggiGalianTanah,
  strukturPerkerasan
}: { 
  tinggiPerkerasan: string; 
  tinggiLapisPondasi: string; 
  tinggiTimbunanTanah: string; 
  tinggiGalianTanah: string;
  strukturPerkerasan: string;
}) => {
  // Convert string values to numbers, default to 0
  const t1 = parseFloat(tinggiPerkerasan) || 0;
  const t2 = parseFloat(tinggiLapisPondasi) || 0;
  const t3 = parseFloat(tinggiTimbunanTanah) || 0;
  const t4 = parseFloat(tinggiGalianTanah) || 0;

  // Calculate proportional heights (max height 200px for visualization)
  const maxHeight = 200;
  const totalHeight = t1 + t2 + t3 + t4;
  const scale = totalHeight > 0 ? Math.min(maxHeight / totalHeight, 2) : 1;

  const h1 = Math.max(t1 * scale, t1 > 0 ? 20 : 0);
  const h2 = Math.max(t2 * scale, t2 > 0 ? 20 : 0);
  const h3 = Math.max(t3 * scale, t3 > 0 ? 20 : 0);
  const h4 = Math.max(t4 * scale, t4 > 0 ? 20 : 0);

  const layerLabel = strukturPerkerasan === 'kaku' ? 'Beton' : 'Aspal';

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">
        Visualisasi Lapisan Jalan
      </h3>
      
      <div className="flex items-end justify-center gap-4">
        {/* 3D Road Layers */}
        <div 
          className="relative"
          style={{ 
            perspective: '500px',
            perspectiveOrigin: 'center center'
          }}
        >
          <div 
            className="relative"
            style={{ 
              transform: 'rotateX(10deg) rotateY(-15deg)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Layer Stack */}
            <div className="flex flex-col-reverse items-center" style={{ width: '160px' }}>
              {/* t4 - Galian Tanah (Dark Brown - Bottom) */}
              {h4 > 0 && (
                <div 
                  className="w-full rounded-b-lg transition-all duration-300 relative"
                  style={{ 
                    height: `${h4}px`,
                    background: 'linear-gradient(180deg, #5D4037 0%, #3E2723 100%)',
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), 0 4px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600 whitespace-nowrap">
                    t4
                  </span>
                </div>
              )}
              
              {/* t3 - Timbunan Tanah (Brown/Ochre) */}
              {h3 > 0 && (
                <div 
                  className="w-full transition-all duration-300 relative"
                  style={{ 
                    height: `${h3}px`,
                    background: 'linear-gradient(180deg, #A1887F 0%, #8D6E63 100%)',
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), 0 4px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600 whitespace-nowrap">
                    t3
                  </span>
                </div>
              )}
              
              {/* t2 - Lapis Pondasi (Dark Gray) */}
              {h2 > 0 && (
                <div 
                  className="w-full transition-all duration-300 relative"
                  style={{ 
                    height: `${h2}px`,
                    background: 'linear-gradient(180deg, #616161 0%, #424242 100%)',
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), 0 4px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600 whitespace-nowrap">
                    t2
                  </span>
                </div>
              )}
              
              {/* t1 - Perkerasan (Light Gray - Top) */}
              {h1 > 0 && (
                <div 
                  className="w-full rounded-t-lg transition-all duration-300 relative"
                  style={{ 
                    height: `${h1}px`,
                    background: 'linear-gradient(180deg, #BDBDBD 0%, #9E9E9E 100%)',
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600 whitespace-nowrap">
                    t1
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: '#BDBDBD' }}></div>
            <span className="text-gray-600">Perkerasan {layerLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: '#616161' }}></div>
            <span className="text-gray-600">Lapis Pondasi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: '#8D6E63' }}></div>
            <span className="text-gray-600">Timbunan Tanah</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: '#5D4037' }}></div>
            <span className="text-gray-600">Galian Tanah</span>
          </div>
        </div>
      </div>

      {/* Height Values */}
      {(t1 > 0 || t2 > 0 || t3 > 0 || t4 > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            {t1 > 0 && <div>t1: <span className="font-medium">{t1} mm</span></div>}
            {t2 > 0 && <div>t2: <span className="font-medium">{t2} mm</span></div>}
            {t3 > 0 && <div>t3: <span className="font-medium">{t3} mm</span></div>}
            {t4 > 0 && <div>t4: <span className="font-medium">{t4} cm</span></div>}
          </div>
        </div>
      )}

      {totalHeight === 0 && (
        <p className="text-center text-gray-400 text-xs mt-4">
          Masukkan tinggi lapisan untuk melihat visualisasi
        </p>
      )}
    </div>
  );
};

export default function TambahUsulanJalanPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState<FormData>({
    jenisUsulan: '',
    lebarJalan: '',
    strukturPerkerasan: '',
    spesifikasiDesain: '',
    mutuBeton: '',
    ruangLingkup: [],
    tinggiPerkerasan: '',
    tinggiLapisPondasi: '',
    tinggiTimbunanTanah: '',
    tinggiGalianTanah: '',
    keteranganGalianTanah: '',
    keteranganMarkaJalan: '',
    keteranganRambuPatok: '',
    keteranganTambahan: '',
  });

  // Get current ruang lingkup options based on struktur
  const ruangLingkupOptions = formData.strukturPerkerasan === 'kaku' ? ruangLingkupKaku : ruangLingkupLentur;
  const spesifikasiOptions = formData.strukturPerkerasan === 'kaku' ? spesifikasiDesainKaku : spesifikasiDesainLentur;

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Reset dependent fields when struktur changes
    if (name === 'strukturPerkerasan') {
      setFormData(prev => ({
        ...prev,
        strukturPerkerasan: value as 'lentur' | 'kaku' | '',
        spesifikasiDesain: '',
        mutuBeton: '',
        ruangLingkup: [],
        tinggiPerkerasan: '',
        tinggiLapisPondasi: '',
        tinggiTimbunanTanah: '',
        tinggiGalianTanah: '',
        keteranganGalianTanah: '',
        keteranganMarkaJalan: '',
        keteranganRambuPatok: '',
      }));
    }
  };

  // Handle checkbox changes for ruang lingkup
  const handleRuangLingkupChange = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      ruangLingkup: prev.ruangLingkup.includes(itemId)
        ? prev.ruangLingkup.filter(r => r !== itemId)
        : [...prev.ruangLingkup, itemId],
    }));
  };

  // Get height field name from item id
  const getHeightFieldName = (itemId: string): keyof FormData | null => {
    switch (itemId) {
      case 'perkerasan_beton':
      case 'perkerasan_aspal':
        return 'tinggiPerkerasan';
      case 'lapis_pondasi':
        return 'tinggiLapisPondasi';
      case 'galian_tanah':
        return 'tinggiGalianTanah';
      case 'timbunan_tanah':
        return 'tinggiTimbunanTanah';
      case 'marka_jalan':
        return 'keteranganMarkaJalan';
      case 'rambu_patok':
        return 'keteranganRambuPatok';
      default:
        return null;
    }
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.jenisUsulan && !!formData.lebarJalan && !!formData.strukturPerkerasan;
      case 2:
        return !!formData.spesifikasiDesain && 
               (formData.strukturPerkerasan !== 'kaku' || !!formData.mutuBeton) &&
               formData.ruangLingkup.length > 0;
      default:
        return true;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get user data for createdBy
      let createdBy = 'Current User';
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          createdBy = parsed.name || parsed.username || 'Current User';
        } catch (e) {
          console.error('Error parsing userData:', e);
        }
      }

      // Create submission data with 3-stage verification status
      const submissionData = {
        ...formData,
        id: Date.now().toString(),
        createdBy,
        verificationStatus: {
          adbang: 'Menunggu',
          bappeda: 'Belum',
          bpkad: 'Belum',
        },
        createdAt: new Date().toISOString().split('T')[0],
      };

      // Get existing submissions or create new array
      const existingData = localStorage.getItem('usulan_jalan_submissions');
      const submissions = existingData ? JSON.parse(existingData) : [];
      submissions.unshift(submissionData); // Add to beginning
      localStorage.setItem('usulan_jalan_submissions', JSON.stringify(submissions));

      alert('Usulan Jalan berhasil disimpan!');
      router.push('/usulan/jalan');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Gagal menyimpan data. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Progress Steps - Now 2 steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {[1, 2].map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep >= step
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
                <span className={`ml-3 text-sm font-medium ${
                  currentStep >= step ? 'text-teal-600' : 'text-gray-500'
                }`}>
                  {step === 1 && 'Data Teknis'}
                  {step === 2 && 'Spesifikasi & Ruang Lingkup'}
                </span>
              </div>
              {index < 1 && (
                <div className={`flex-1 h-1 mx-4 rounded ${
                  currentStep > step ? 'bg-teal-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Step 1: Data Teknis */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <Route className="w-6 h-6 text-white" />
                <h2 className="text-lg font-semibold text-white">Data Teknis Jalan</h2>
              </div>
              <p className="text-teal-100 text-sm mt-1">
                Kuisioner komponen ASB Fisik untuk merekap data detail teknis
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Jenis Usulan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Jenis Usulan <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.jenisUsulan === 'Pembuatan'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="jenisUsulan"
                      value="Pembuatan"
                      checked={formData.jenisUsulan === 'Pembuatan'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Pembuatan</span>
                      <p className="text-xs text-gray-500">Pembangunan jalan baru</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.jenisUsulan === 'Pemeliharaan'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="jenisUsulan"
                      value="Pemeliharaan"
                      checked={formData.jenisUsulan === 'Pemeliharaan'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Pemeliharaan</span>
                      <p className="text-xs text-gray-500">Perbaikan/pemeliharaan jalan</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Lebar Jalan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Lebar Jalan <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {lebarJalanOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.lebarJalan === option.value
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="lebarJalan"
                        value={option.value}
                        checked={formData.lebarJalan === option.value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Struktur Perkerasan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Struktur Perkerasan Jalan <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.strukturPerkerasan === 'lentur'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="strukturPerkerasan"
                      value="lentur"
                      checked={formData.strukturPerkerasan === 'lentur'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Perkerasan Lentur</span>
                      <p className="text-xs text-gray-500">(Flexible Pavement)</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.strukturPerkerasan === 'kaku'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="strukturPerkerasan"
                      value="kaku"
                      checked={formData.strukturPerkerasan === 'kaku'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Perkerasan Kaku</span>
                      <p className="text-xs text-gray-500">(Rigid Pavement)</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Spesifikasi & Ruang Lingkup (Combined) */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Spesifikasi Desain */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Info className="w-6 h-6 text-white" />
                    <h2 className="text-lg font-semibold text-white">
                      Spesifikasi Desain Perkerasan {formData.strukturPerkerasan === 'kaku' ? 'Kaku' : 'Lentur'}
                    </h2>
                  </div>
                  <p className="text-teal-100 text-sm mt-1">
                    Ruang lingkup berdasarkan Manual Desain Perkerasan Jalan 2024
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Spesifikasi Desain */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Spesifikasi Desain <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                      {spesifikasiOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            formData.spesifikasiDesain === option.value
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="spesifikasiDesain"
                            value={option.value}
                            checked={formData.spesifikasiDesain === option.value}
                            onChange={handleInputChange}
                            className="w-4 h-4 mt-0.5 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="ml-3 text-sm text-gray-900">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Mutu Beton (only for Kaku) */}
                  {formData.strukturPerkerasan === 'kaku' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Mutu Beton <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {mutuBetonOptions.map((option) => (
                          <label
                            key={option.value}
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              formData.mutuBeton === option.value
                                ? 'border-teal-500 bg-teal-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="mutuBeton"
                              value={option.value}
                              checked={formData.mutuBeton === option.value}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-900">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ruang Lingkup Pekerjaan */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Route className="w-6 h-6 text-white" />
                    <h2 className="text-lg font-semibold text-white">
                      Ruang Lingkup Pekerjaan
                    </h2>
                  </div>
                  <p className="text-teal-100 text-sm mt-1">
                    Pilih komponen dan masukkan dimensi yang akan dikerjakan
                  </p>
                </div>

                <div className="p-6">
                  {/* Table Format */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 w-12">Cek</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Pekerjaan</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 w-40">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ruangLingkupOptions.map((item) => {
                          const isChecked = formData.ruangLingkup.includes(item.id);
                          const heightField = getHeightFieldName(item.id);
                          
                          return (
                            <tr key={item.id} className="border-b border-gray-100">
                              <td className="py-3 px-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleRuangLingkupChange(item.id)}
                                  className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"
                                />
                              </td>
                              <td className="py-3 px-2">
                                <span className={`text-sm ${isChecked ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                  {item.label}
                                </span>
                              </td>
                              <td className="py-3 px-2">
                                {item.hasHeight && isChecked && heightField && (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      name={heightField}
                                      value={formData[heightField] as string}
                                      onChange={handleInputChange}
                                      placeholder="..."
                                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                                      min="0"
                                      step="0.1"
                                    />
                                    <span className="text-sm text-gray-500">{item.unit}</span>
                                  </div>
                                )}
                                {!item.hasHeight && isChecked && (
                                  <span className="text-sm text-gray-400">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Keterangan Tambahan */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keterangan Tambahan
                    </label>
                    <textarea
                      name="keteranganTambahan"
                      value={formData.keteranganTambahan}
                      onChange={handleInputChange}
                      placeholder="Catatan tambahan untuk pekerjaan..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - 3D Visualization */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <RoadVisualization
                  tinggiPerkerasan={formData.tinggiPerkerasan}
                  tinggiLapisPondasi={formData.tinggiLapisPondasi}
                  tinggiTimbunanTanah={formData.tinggiTimbunanTanah}
                  tinggiGalianTanah={formData.tinggiGalianTanah}
                  strukturPerkerasan={formData.strukturPerkerasan}
                />

                {/* Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Ringkasan Data</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Jenis Usulan:</span>
                      <span className="font-medium">{formData.jenisUsulan || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Lebar Jalan:</span>
                      <span className="font-medium">{formData.lebarJalan ? `${formData.lebarJalan} m` : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Struktur:</span>
                      <span className="font-medium capitalize">{formData.strukturPerkerasan || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ruang Lingkup:</span>
                      <span className="font-medium">{formData.ruangLingkup.length} item</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.push('/usulan/jalan')}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            {currentStep === 1 ? 'Kembali' : 'Sebelumnya'}
          </button>

          <div className="flex gap-3">
            {currentStep < 2 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!validateStep(currentStep)}
                className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Selanjutnya
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !validateStep(2)}
                className="flex items-center gap-2 px-8 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Simpan Usulan
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
