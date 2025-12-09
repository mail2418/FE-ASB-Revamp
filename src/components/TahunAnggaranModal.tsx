'use client';

import React, { useState } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';

interface TahunAnggaranModalProps {
  isOpen: boolean;
  onConfirm: (year: number) => void;
}

export default function TahunAnggaranModal({ isOpen, onConfirm }: TahunAnggaranModalProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  if (!isOpen) return null;

  const handleConfirm = () => {
    localStorage.setItem('selectedTahunAnggaran', selectedYear.toString());
    onConfirm(selectedYear);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Rencana Tahun Anggaran</h2>
          <p className="text-white/80 mt-2 text-sm">
            Pilih tahun anggaran untuk sesi kerja Anda
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Pilih Tahun Anggaran
          </label>
          <div className="grid grid-cols-3 gap-3">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`py-3 px-4 rounded-xl font-semibold text-center transition-all duration-200 ${
                  selectedYear === year
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
            <p className="text-sm text-orange-800">
              <strong>Info:</strong> Tahun anggaran yang dipilih akan digunakan untuk memfilter data usulan dan laporan.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleConfirm}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg shadow-orange-500/30"
          >
            Konfirmasi Pilihan
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
