'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Route, ChevronRight, Save, ArrowLeft, Info } from 'lucide-react';

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

export default function TambahUsulanJalanPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
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
      // For now, just save to localStorage and redirect
      const submissionData = {
        ...formData,
        id: Date.now().toString(),
        userName: 'Current User', // Would come from auth context
        status: 'Pending',
        createdAt: new Date().toISOString().split('T')[0],
      };

      // Get existing submissions or create new array
      const existingData = localStorage.getItem('usulan_jalan_submissions');
      const submissions = existingData ? JSON.parse(existingData) : [];
      submissions.push(submissionData);
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
    <div className="max-w-4xl mx-auto space-y-6">
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
                      formData.jenisUsulan === 'Perawatan'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="jenisUsulan"
                      value="Perawatan"
                      checked={formData.jenisUsulan === 'Perawatan'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Perawatan</span>
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

              {/* Repetisi Beban & CBR */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repetisi Beban Sumbu Kumulatif (juta ESA5) <span className="text-red-500">*</span>
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
                  <p className="mt-1 text-xs text-gray-500">
                    Repetisi pada 20 Tahun Lajur Rencana
                  </p>
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
                  <p className="mt-1 text-xs text-gray-500">
                    California Bearing Ratio - berpengaruh terhadap kelas jalan
                  </p>
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
        )}

        {/* Step 3: Ruang Lingkup */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <Route className="w-6 h-6 text-white" />
                <h2 className="text-lg font-semibold text-white">
                  Ruang Lingkup Perkerasan {formData.strukturPerkerasan === 'kaku' ? 'Kaku' : 'Lentur'}
                </h2>
              </div>
              <p className="text-teal-100 text-sm mt-1">
                Pilih komponen yang akan dikerjakan
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Ruang Lingkup Checkboxes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Ruang Lingkup Pekerjaan <span className="text-red-500">*</span>
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

              {/* Keterangan Tambahan */}
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

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Ringkasan Data</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Lebar Jalan:</span>
                    <span className="ml-2 font-medium">{formData.lebarJalan} m</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Struktur:</span>
                    <span className="ml-2 font-medium capitalize">{formData.strukturPerkerasan}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">ESA5:</span>
                    <span className="ml-2 font-medium">{formData.repetisiBeban} juta</span>
                  </div>
                  <div>
                    <span className="text-gray-500">CBR:</span>
                    <span className="ml-2 font-medium">{formData.nilaiCBR}%</span>
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
            {currentStep < 3 ? (
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
                disabled={isSubmitting || !validateStep(3)}
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
