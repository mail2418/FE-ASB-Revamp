'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Droplets, ChevronRight, Save, ArrowLeft, Info } from 'lucide-react';

// Types for form data
interface FormData {
  jenisUsulan: 'Pembuatan' | 'Rehabilitasi' | 'Normalisasi' | '';
  tipeSaluran: 'primer' | 'sekunder' | 'tersier' | '';
  bentukSaluran: 'trapesium' | 'segiempat' | 'setengah_lingkaran' | 'kombinasi' | '';
  // Dimensi Saluran
  panjangSaluran: string;
  lebarAtas: string;
  lebarBawah: string;
  kedalaman: string;
  kemiringan: string;
  // Material dan Konstruksi
  materialDinding: 'beton' | 'batu_kali' | 'pasangan_bata' | 'tanah' | '';
  materialDasar: 'beton' | 'batu_kali' | 'tanah_dasar' | '';
  // Spesifikasi Teknis
  debitRencana: string;
  koefisienKekasaran: string;
  // Ruang Lingkup
  ruangLingkup: string[];
  keteranganTambahan: string;
}

// Options for form fields
const tipeSaluranOptions = [
  { value: 'primer', label: 'Saluran Primer', desc: 'Saluran utama penampung air' },
  { value: 'sekunder', label: 'Saluran Sekunder', desc: 'Saluran penghubung' },
  { value: 'tersier', label: 'Saluran Tersier', desc: 'Saluran pembuang lokal' },
];

const bentukSaluranOptions = [
  { value: 'trapesium', label: 'Trapesium' },
  { value: 'segiempat', label: 'Segiempat / Persegi' },
  { value: 'setengah_lingkaran', label: 'Setengah Lingkaran' },
  { value: 'kombinasi', label: 'Kombinasi' },
];

const materialDindingOptions = [
  { value: 'beton', label: 'Beton Bertulang' },
  { value: 'batu_kali', label: 'Pasangan Batu Kali' },
  { value: 'pasangan_bata', label: 'Pasangan Bata' },
  { value: 'tanah', label: 'Tanah' },
];

const materialDasarOptions = [
  { value: 'beton', label: 'Beton' },
  { value: 'batu_kali', label: 'Pasangan Batu Kali' },
  { value: 'tanah_dasar', label: 'Tanah Dasar' },
];

const ruangLingkupOptions = [
  'Pembangunan Saluran',
  'Pengecoran Dinding',
  'Pengecoran Dasar',
  'Galian Tanah',
  'Timbunan dan Urugan',
  'Pembongkaran Saluran Lama',
  'Gorong-gorong / Box Culvert',
  'Pintu Air',
  'Perbaikan Talud',
  'Pembersihan Sedimen',
  'Perbaikan Siphon',
];

export default function TambahUsulanSaluranPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<FormData>({
    jenisUsulan: '',
    tipeSaluran: '',
    bentukSaluran: '',
    panjangSaluran: '',
    lebarAtas: '',
    lebarBawah: '',
    kedalaman: '',
    kemiringan: '',
    materialDinding: '',
    materialDasar: '',
    debitRencana: '',
    koefisienKekasaran: '',
    ruangLingkup: [],
    keteranganTambahan: '',
  });

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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
        return !!formData.jenisUsulan && !!formData.tipeSaluran && !!formData.bentukSaluran;
      case 2:
        return !!formData.panjangSaluran && !!formData.lebarAtas && !!formData.kedalaman &&
               !!formData.materialDinding && !!formData.materialDasar;
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
        userName: 'Current User',
        status: 'Pending',
        createdAt: new Date().toISOString().split('T')[0],
      };

      // Get existing submissions or create new array
      const existingData = localStorage.getItem('usulan_saluran_submissions');
      const submissions = existingData ? JSON.parse(existingData) : [];
      submissions.push(submissionData);
      localStorage.setItem('usulan_saluran_submissions', JSON.stringify(submissions));

      alert('Usulan Saluran berhasil disimpan!');
      router.push('/usulan/saluran');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Gagal menyimpan data. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get label helper
  const getJenisLabel = (value: string) => {
    switch (value) {
      case 'Pembuatan': return 'Pembuatan Baru';
      case 'Rehabilitasi': return 'Rehabilitasi/Perbaikan';
      case 'Normalisasi': return 'Normalisasi Saluran';
      default: return value;
    }
  };

  const getTipeLabel = (value: string) => {
    const option = tipeSaluranOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getBentukLabel = (value: string) => {
    const option = bentukSaluranOptions.find(opt => opt.value === value);
    return option ? option.label : value;
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
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
                <span className={`ml-3 text-sm font-medium ${
                  currentStep >= step ? 'text-orange-600' : 'text-gray-500'
                }`}>
                  {step === 1 && 'Jenis & Tipe'}
                  {step === 2 && 'Dimensi & Material'}
                  {step === 3 && 'Ruang Lingkup'}
                </span>
              </div>
              {index < 2 && (
                <div className={`flex-1 h-1 mx-4 rounded ${
                  currentStep > step ? 'bg-orange-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Step 1: Jenis & Tipe Saluran */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <Droplets className="w-6 h-6 text-white" />
                <h2 className="text-lg font-semibold text-white">Jenis & Tipe Saluran</h2>
              </div>
              <p className="text-orange-100 text-sm mt-1">
                Tentukan jenis usulan dan tipe saluran yang akan dibangun
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Jenis Usulan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Jenis Usulan <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.jenisUsulan === 'Pembuatan'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="jenisUsulan"
                      value="Pembuatan"
                      checked={formData.jenisUsulan === 'Pembuatan'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Pembuatan</span>
                      <p className="text-xs text-gray-500">Saluran baru</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.jenisUsulan === 'Rehabilitasi'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="jenisUsulan"
                      value="Rehabilitasi"
                      checked={formData.jenisUsulan === 'Rehabilitasi'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Rehabilitasi</span>
                      <p className="text-xs text-gray-500">Perbaikan saluran</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.jenisUsulan === 'Normalisasi'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="jenisUsulan"
                      value="Normalisasi"
                      checked={formData.jenisUsulan === 'Normalisasi'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Normalisasi</span>
                      <p className="text-xs text-gray-500">Pemulihan kapasitas</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Tipe Saluran */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipe Saluran <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tipeSaluranOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.tipeSaluran === option.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipeSaluran"
                        value={option.value}
                        checked={formData.tipeSaluran === option.value}
                        onChange={handleInputChange}
                        className="w-4 h-4 mt-0.5 text-orange-600 focus:ring-orange-500"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900">{option.label}</span>
                        <p className="text-xs text-gray-500">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bentuk Saluran */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Bentuk Penampang Saluran <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {bentukSaluranOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.bentukSaluran === option.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="bentukSaluran"
                        value={option.value}
                        checked={formData.bentukSaluran === option.value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Dimensi & Material */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <Info className="w-6 h-6 text-white" />
                <h2 className="text-lg font-semibold text-white">Dimensi & Material</h2>
              </div>
              <p className="text-orange-100 text-sm mt-1">
                Spesifikasi teknis dimensi dan material saluran
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Dimensi Saluran */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Dimensi Saluran</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Panjang Saluran (m) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="panjangSaluran"
                      value={formData.panjangSaluran}
                      onChange={handleInputChange}
                      placeholder="Contoh: 500"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lebar Atas (m) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="lebarAtas"
                      value={formData.lebarAtas}
                      onChange={handleInputChange}
                      placeholder="Contoh: 1.5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lebar Bawah (m)
                    </label>
                    <input
                      type="number"
                      name="lebarBawah"
                      value={formData.lebarBawah}
                      onChange={handleInputChange}
                      placeholder="Contoh: 1.0 (untuk trapesium)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                    <p className="mt-1 text-xs text-gray-500">Isi jika bentuk trapesium</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kedalaman (m) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="kedalaman"
                      value={formData.kedalaman}
                      onChange={handleInputChange}
                      placeholder="Contoh: 0.8"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kemiringan (%)
                    </label>
                    <input
                      type="number"
                      name="kemiringan"
                      value={formData.kemiringan}
                      onChange={handleInputChange}
                      placeholder="Contoh: 0.5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Debit Rencana (m³/s)
                    </label>
                    <input
                      type="number"
                      name="debitRencana"
                      value={formData.debitRencana}
                      onChange={handleInputChange}
                      placeholder="Contoh: 2.5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Material */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Material Konstruksi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Material Dinding <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {materialDindingOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            formData.materialDinding === option.value
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="materialDinding"
                            value={option.value}
                            checked={formData.materialDinding === option.value}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                          />
                          <span className="ml-3 text-sm text-gray-900">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Material Dasar <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {materialDasarOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            formData.materialDasar === option.value
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="materialDasar"
                            value={option.value}
                            checked={formData.materialDasar === option.value}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                          />
                          <span className="ml-3 text-sm text-gray-900">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Ruang Lingkup */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <Droplets className="w-6 h-6 text-white" />
                <h2 className="text-lg font-semibold text-white">Ruang Lingkup Pekerjaan</h2>
              </div>
              <p className="text-orange-100 text-sm mt-1">
                Pilih komponen pekerjaan yang akan dikerjakan
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
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.ruangLingkup.includes(item)}
                        onChange={() => handleRuangLingkupChange(item)}
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
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
                  placeholder="Tambahkan informasi detail lainnya seperti kondisi lokasi, kendala lapangan, dll."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Ringkasan Data</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Jenis Usulan:</span>
                    <span className="ml-2 font-medium">{getJenisLabel(formData.jenisUsulan)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tipe Saluran:</span>
                    <span className="ml-2 font-medium">{getTipeLabel(formData.tipeSaluran)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Bentuk:</span>
                    <span className="ml-2 font-medium capitalize">{getBentukLabel(formData.bentukSaluran)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Panjang:</span>
                    <span className="ml-2 font-medium">{formData.panjangSaluran} m</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Lebar Atas:</span>
                    <span className="ml-2 font-medium">{formData.lebarAtas} m</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Kedalaman:</span>
                    <span className="ml-2 font-medium">{formData.kedalaman} m</span>
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
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.push('/usulan/saluran')}
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
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Selanjutnya
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !validateStep(3)}
                className="flex items-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
