'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function InputKomponenNonStandarPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Input Komponen Non Standar Pembangunan
        </h1>
        <p className="text-gray-600 mb-8">
          Halaman ini belum diimplementasikan sepenuhnya. Ini adalah placeholder untuk navigasi.
        </p>
        
        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}
