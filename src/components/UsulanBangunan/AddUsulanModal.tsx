'use client';
import React, { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import type { UsulanBangunanGedung } from '@/types/usulan-bangunan';
import { cn } from '@/lib/utils';
import Router from 'next/router';

interface AddUsulanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<UsulanBangunanGedung>) => void;
}

export default function AddUsulanModal({
  isOpen,
  onClose,
  onSubmit,
}: AddUsulanModalProps) {
  const [formData, setFormData] = useState<Partial<UsulanBangunanGedung>>({
    jenis: 'Pembangunan',
    uraian: '',
    lokasi: '',
    klasifikasi: 'Gedung Negara Sederhana',
    satuan: 'm2',
    nilaiBkf: 0,
    sumberPembiayaan: 'APBD',
    status: 'Draft',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const klasifikasiOptions = [
    'Gedung Negara Sederhana',
    'Gedung Negara Tidak Sederhana',
    'Rumah Negara Tipe A',
    'Rumah Negara Tipe B',
    'Rumah Negara Tipe C',
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.uraian) {
      newErrors.uraian = 'Uraian wajib diisi';
    }
    if (!formData.lokasi) {
      newErrors.lokasi = 'Lokasi wajib diisi';
    }
    if (!formData.nilaiBkf || formData.nilaiBkf <= 0) {
      newErrors.nilaiBkf = 'Nilai BKF harus lebih dari 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      jenis: 'Pembangunan',
      uraian: '',
      lokasi: '',
      klasifikasi: 'Gedung Negara Sederhana',
      satuan: 'm2',
      nilaiBkf: 0,
      sumberPembiayaan: 'APBD',
      status: 'Draft',
    });
    setErrors({});
    onClose();
  };

  const handleFileUpload = (field: string) => {
    // In production, implement actual file upload
    console.log(`Upload file for ${field}`);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 cursor-pointer">Tambah Usulan Baru</h2>
              <button
                onClick={(e:any)=>{
                  e.preventDefault();
                  Router.push('/tambah')
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Jenis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Usulan
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="jenis"
                    value="Pembangunan"
                    checked={formData.jenis === 'Pembangunan'}
                    onChange={(e) =>
                      setFormData({ ...formData, jenis: e.target.value as any })
                    }
                    className="mr-2 text-teal-500 focus:ring-teal-500"
                  />
                  <span className="text-sm">Pembangunan</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="jenis"
                    value="Pemeliharaan"
                    checked={formData.jenis === 'Pemeliharaan'}
                    onChange={(e) =>
                      setFormData({ ...formData, jenis: e.target.value as any })
                    }
                    className="mr-2 text-teal-500 focus:ring-teal-500"
                  />
                  <span className="text-sm">Pemeliharaan</span>
                </label>
              </div>
            </div>

            {/* Uraian */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uraian <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.uraian}
                onChange={(e) =>
                  setFormData({ ...formData, uraian: e.target.value })
                }
                rows={3}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500',
                  errors.uraian ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="Masukkan uraian konstruksi..."
              />
              {errors.uraian && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.uraian}
                </p>
              )}
            </div>

            {/* Lokasi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lokasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lokasi}
                onChange={(e) =>
                  setFormData({ ...formData, lokasi: e.target.value })
                }
                className={cn(
                  'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500',
                  errors.lokasi ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="Jl. Contoh, Kab/Kota"
              />
              {errors.lokasi && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.lokasi}
                </p>
              )}
            </div>

            {/* Klasifikasi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Klasifikasi
              </label>
              <select
                value={formData.klasifikasi}
                onChange={(e) =>
                  setFormData({ ...formData, klasifikasi: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {klasifikasiOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Satuan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Satuan
                </label>
                <select
                  value={formData.satuan}
                  onChange={(e) =>
                    setFormData({ ...formData, satuan: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="m2">m²</option>
                  <option value="unit">Unit</option>
                  <option value="paket">Paket</option>
                </select>
              </div>

              {/* Nilai BKF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nilai BKF <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.nilaiBkf}
                  onChange={(e) =>
                    setFormData({ ...formData, nilaiBkf: Number(e.target.value) })
                  }
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500',
                    errors.nilaiBkf ? 'border-red-500' : 'border-gray-300'
                  )}
                  placeholder="0"
                />
                {errors.nilaiBkf && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.nilaiBkf}
                  </p>
                )}
              </div>
            </div>

            {/* Sumber Pembiayaan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sumber Pembiayaan
              </label>
              <select
                value={formData.sumberPembiayaan}
                onChange={(e) =>
                  setFormData({ ...formData, sumberPembiayaan: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="APBD">APBD</option>
                <option value="APBN">APBN</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Surat Permohonan
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleFileUpload('suratPermohonan')}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
                <span className="text-xs text-gray-500">
                  Format: PDF, maksimal 5MB
                </span>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                type="submit"
                className={cn(
                  'px-4 py-2 text-sm font-medium text-white bg-teal-500 rounded-lg hover:bg-teal-600 transition-colors',
                  isSubmitting && 'opacity-50 cursor-not-allowed'
                )}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Usulan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}