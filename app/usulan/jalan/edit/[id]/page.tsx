'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Route, ChevronRight, Save, ArrowLeft, Info, Loader2 } from 'lucide-react';

// Types for form data
interface FormData {
  jenisUsulan: 'Perawatan' | 'Pembuatan' | '';
  lebarJalan: string;
  strukturPerkerasan: 'lentur' | 'kaku' | '';
  repetisiBeban: string;
  nilaiCBR: string;
  spesifikasiDesain: string;
  mutuBeton: string;
  ruangLingkup: string[];
  keteranganTambahan: string;
}

interface VerificationStages {
  adpem: string;
  bappeda: string;
  bpkad: string;
}

interface UsulanJalan extends FormData {
  id: string;
  verificationStatus: VerificationStages;
  createdAt: string;
  createdBy?: string;
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
  'Perkerasan Aspal',
  'Lapis Pondasi',
  'Galian Tanah',
  'Timbunan Tanah',
  'Pemadatan Tanah',
  'Marka dan Rambu Jalan',
  'Patok Jalan (Patok Rambu, Pengarah, dan Kilometer)',
  'Median Jalan',
];

const ruangLingkupKaku = [
  'Perkerasan Beton',
  'Lapis Pondasi',
  'Galian Tanah',
  'Timbunan Tanah',
  'Pemadatan Tanah',
  'Marka dan Rambu Jalan',
  'Patok Jalan (Patok Rambu, Pengarah, dan Kilometer)',
  'Median Jalan',
];

export default function EditUsulanJalanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [originalData, setOriginalData] = useState<UsulanJalan | null>(null);
  const [notFound, setNotFound] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    jenisUsulan: '',
    lebarJalan: '',
    strukturPerkerasan: '',
    repetisiBeban: '',
    nilaiCBR: '',
    spesifikasiDesain: '',
    mutuBeton: '',
    ruangLingkup: [],
    keteranganTambahan: '',
  });

  // Load existing data
  useEffect(() => {
    const loadData = () => {
      const storedData = localStorage.getItem('usulan_jalan_submissions');
      if (storedData) {
        try {
          const submissions: UsulanJalan[] = JSON.parse(storedData);
          const found = submissions.find(item => item.id === id);
          
          if (found) {
            setOriginalData(found);
            setFormData({
              jenisUsulan: found.jenisUsulan || '',
              lebarJalan: found.lebarJalan || '',
              strukturPerkerasan: found.strukturPerkerasan as 'lentur' | 'kaku' | '' || '',
              repetisiBeban: found.repetisiBeban || '',
              nilaiCBR: found.nilaiCBR || '',
              spesifikasiDesain: found.spesifikasiDesain || '',
              mutuBeton: found.mutuBeton || '',
              ruangLingkup: found.ruangLingkup || [],
              keteranganTambahan: found.keteranganTambahan || '',
            });
          } else {
            setNotFound(true);
          }
        } catch (e) {
          console.error('Error parsing stored data:', e);
          setNotFound(true);
        }
      } else {
        setNotFound(true);
      }
      setIsLoading(false);
    };

    loadData();
  }, [id]);

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
      }));
    }
  };

  // Handle checkbox changes for ruang lingkup
  const handleRuangLingkupChange = (item: string) => {
    setFormData(prev => ({
      ...prev,
      ruangLingkup: prev.ruangLingkup.includes(item)
        ? prev.ruangLingkup.filter(r => r !== item)
        : [...prev.ruangLingkup, item],
    }));
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.jenisUsulan && !!formData.lebarJalan && !!formData.strukturPerkerasan && 
               !!formData.repetisiBeban && !!formData.nilaiCBR;
      case 2:
        return !!formData.spesifikasiDesain && 
               (formData.strukturPerkerasan !== 'kaku' || !!formData.mutuBeton);
      case 3:
        return formData.ruangLingkup.length > 0;
      default:
        return true;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!originalData) {
        throw new Error('Original data not found');
      }

      // Create updated data
      const updatedData: UsulanJalan = {
        ...originalData,
        ...formData,
        // Keep original verification status, createdAt, createdBy
      };

      // Update in localStorage
      const storedData = localStorage.getItem('usulan_jalan_submissions');
      if (storedData) {
        const submissions: UsulanJalan[] = JSON.parse(storedData);
        const index = submissions.findIndex(item => item.id === id);
        
        if (index !== -1) {
          submissions[index] = updatedData;
          localStorage.setItem('usulan_jalan_submissions', JSON.stringify(submissions));
        }
      }

      alert('Usulan Jalan berhasil diperbarui!');
      router.push('/usulan/jalan');
    } catch (error) {
      console.error('Error updating form:', error);
      alert('Gagal memperbarui data. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Route className="w-16 h-16 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-700">Data tidak ditemukan</h2>
        <p className="text-gray-500">Usulan jalan dengan ID tersebut tidak ditemukan</p>
        <button
          onClick={() => router.push('/usulan/jalan')}
          className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/usulan/jalan')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Usulan Jalan</h1>
          <p className="text-sm text-gray-500">ID: {id}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step, index) => (
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
                  {step === 2 && 'Spesifikasi Desain'}
                  {step === 3 && 'Ruang Lingkup'}
                </span>
              </div>
              {index < 2 && (
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
            </div>

            <div className="p-6 space-y-6">
              {/* Jenis Usulan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Jenis Usulan <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Pembuatan', 'Perawatan'].map((jenis) => (
                    <label
                      key={jenis}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.jenisUsulan === jenis
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="jenisUsulan"
                        value={jenis}
                        checked={formData.jenisUsulan === jenis}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">{jenis}</span>
                    </label>
                  ))}
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
                  Struktur Perkerasan <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { value: 'lentur', label: 'Perkerasan Lentur', sub: '(Flexible Pavement)' },
                    { value: 'kaku', label: 'Perkerasan Kaku', sub: '(Rigid Pavement)' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.strukturPerkerasan === opt.value
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="strukturPerkerasan"
                        value={opt.value}
                        checked={formData.strukturPerkerasan === opt.value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                        <p className="text-xs text-gray-500">{opt.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Repetisi Beban & CBR */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repetisi Beban (juta ESA5) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="repetisiBeban"
                    value={formData.repetisiBeban}
                    onChange={handleInputChange}
                    placeholder="Contoh: 10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nilai CBR Tanah (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="nilaiCBR"
                    value={formData.nilaiCBR}
                    onChange={handleInputChange}
                    placeholder="Contoh: 6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Spesifikasi Desain */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <Info className="w-6 h-6 text-white" />
                <h2 className="text-lg font-semibold text-white">Spesifikasi Desain</h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
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
        )}

        {/* Step 3: Ruang Lingkup */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <Route className="w-6 h-6 text-white" />
                <h2 className="text-lg font-semibold text-white">Ruang Lingkup Pekerjaan</h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Ruang Lingkup <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ruangLingkupOptions.map((item) => (
                    <label
                      key={item}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.ruangLingkup.includes(item)
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.ruangLingkup.includes(item)}
                        onChange={() => handleRuangLingkupChange(item)}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <span className="ml-3 text-sm text-gray-900">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keterangan Tambahan
                </label>
                <textarea
                  name="keteranganTambahan"
                  value={formData.keteranganTambahan}
                  onChange={handleInputChange}
                  placeholder="Tebal Galian, Urugan, dan / atau Timbunan"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.push('/usulan/jalan')}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            {currentStep === 1 ? 'Kembali' : 'Sebelumnya'}
          </button>

          <div className="flex gap-3">
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!validateStep(currentStep)}
                className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !validateStep(3)}
                className="flex items-center gap-2 px-8 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Simpan Perubahan
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
