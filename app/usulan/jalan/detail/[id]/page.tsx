'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Route, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  XCircle,
  MapPin,
  Layers,
  FileText,
  Settings,
  Ruler
} from 'lucide-react';

// Interface for Jalan form data
interface UsulanJalanDetail {
  id: string;
  jenisUsulan: 'Perawatan' | 'Pembuatan';
  lebarJalan: string;
  strukturPerkerasan: 'Perkerasan Lentur' | 'Perkerasan Kaku';
  repetisiBeban: string;
  nilaiCBR: string;
  spesifikasiDesain: string;
  mutuBeton?: string;
  ruangLingkup: string[];
  keteranganTambahan: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  createdBy?: string;
}

// Mock data - in production this would come from API
const mockDataMap: { [key: string]: UsulanJalanDetail } = {
  '1': {
    id: '1',
    jenisUsulan: 'Pembuatan',
    lebarJalan: '5 m',
    strukturPerkerasan: 'Perkerasan Lentur',
    repetisiBeban: '10',
    nilaiCBR: '6',
    spesifikasiDesain: 'Bagan Desain 3 : Opsi Biaya Minimum dengan CTB',
    ruangLingkup: ['Perkerasan Aspal', 'Lapis Pondasi', 'Galian Tanah'],
    keteranganTambahan: 'Tebal galian 30 cm',
    status: 'Approved',
    createdAt: '2024-11-15',
    createdBy: 'Anggito Anju',
  },
  '2': {
    id: '2',
    jenisUsulan: 'Perawatan',
    lebarJalan: '7 m',
    strukturPerkerasan: 'Perkerasan Kaku',
    repetisiBeban: '15',
    nilaiCBR: '8',
    spesifikasiDesain: 'Bagan Desain 4 : Perkerasan Kaku untuk Beban Lalu Lintas Berat',
    mutuBeton: "f'c 25 Mpa",
    ruangLingkup: ['Perkerasan Beton', 'Lapis Pondasi', 'Pemadatan Tanah', 'Marka dan Rambu Jalan'],
    keteranganTambahan: 'Tebal timbunan 50 cm',
    status: 'Pending',
    createdAt: '2024-11-20',
    createdBy: 'Muhammad Ismail',
  },
  '3': {
    id: '3',
    jenisUsulan: 'Pembuatan',
    lebarJalan: '4 m',
    strukturPerkerasan: 'Perkerasan Lentur',
    repetisiBeban: '5',
    nilaiCBR: '4',
    spesifikasiDesain: 'Bagan Desain 3A : Opsi Biaya Minimum dengan HRS',
    ruangLingkup: ['Perkerasan Aspal', 'Galian Tanah', 'Timbunan Tanah'],
    keteranganTambahan: 'Tebal urugan 20 cm',
    status: 'Rejected',
    createdAt: '2024-11-10',
    createdBy: 'Samarta Admin',
  },
  '4': {
    id: '4',
    jenisUsulan: 'Perawatan',
    lebarJalan: '10 m',
    strukturPerkerasan: 'Perkerasan Lentur',
    repetisiBeban: '20',
    nilaiCBR: '10',
    spesifikasiDesain: 'Bagan Desain 3B : Aspal dengan Lapis Fondasi Berbutir',
    ruangLingkup: ['Perkerasan Aspal', 'Lapis Pondasi', 'Pemadatan Tanah', 'Median Jalan'],
    keteranganTambahan: '-',
    status: 'Approved',
    createdAt: '2024-11-25',
    createdBy: 'Budi Santoso',
  },
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    Pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" />, label: 'Menunggu' },
    Approved: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-4 h-4" />, label: 'Disetujui' },
    Rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-4 h-4" />, label: 'Ditolak' },
  };
  const c = config[status as keyof typeof config] || config.Pending;
  
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${c.bg} ${c.text}`}>
      {c.icon}
      {c.label}
    </span>
  );
};

export default function DetailUsulanJalanPage() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<UsulanJalanDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, fetch from API
    const id = params.id as string;
    const usulanData = mockDataMap[id];
    
    if (usulanData) {
      setData(usulanData);
    }
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!data) {
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
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/usulan/jalan')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </button>
        <StatusBadge status={data.status} />
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <Route className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Detail Usulan Jalan</h1>
              <p className="text-teal-100 text-sm">ID: {data.id}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Jenis Usulan */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <FileText className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide font-medium">Jenis Usulan</span>
              </div>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                data.jenisUsulan === 'Pembuatan' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {data.jenisUsulan}
              </span>
            </div>

            {/* Lebar Jalan */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Ruler className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide font-medium">Lebar Jalan</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{data.lebarJalan}</p>
            </div>

            {/* Struktur Perkerasan */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Layers className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide font-medium">Struktur Perkerasan</span>
              </div>
              <span className={`inline-flex px-3 py-1 rounded text-sm font-medium ${
                data.strukturPerkerasan === 'Perkerasan Lentur' 
                  ? 'bg-indigo-100 text-indigo-800' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {data.strukturPerkerasan}
              </span>
            </div>

            {/* Mutu Beton (if applicable) */}
            {data.mutuBeton && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Settings className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide font-medium">Mutu Beton</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{data.mutuBeton}</p>
              </div>
            )}

            {/* Sumbu Kumulatif */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide font-medium">Sumbu Kumulatif (ESA5)</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{data.repetisiBeban} juta</p>
              <p className="text-xs text-gray-500 mt-1">Repetisi pada 20 Tahun Lajur Rencana</p>
            </div>

            {/* Nilai CBR */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Settings className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide font-medium">Nilai CBR Tanah</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{data.nilaiCBR}%</p>
              <p className="text-xs text-gray-500 mt-1">California Bearing Ratio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Spesifikasi Desain */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Spesifikasi Desain</h2>
        </div>
        <div className="p-6">
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <p className="text-teal-800 font-medium">{data.spesifikasiDesain}</p>
          </div>
        </div>
      </div>

      {/* Ruang Lingkup */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Ruang Lingkup Pekerjaan</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {data.ruangLingkup.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium"
              >
                <CheckCircle className="w-4 h-4 mr-2 text-teal-500" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Keterangan Tambahan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Keterangan Tambahan</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-700">{data.keteranganTambahan || '-'}</p>
        </div>
      </div>

      {/* Meta Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Informasi Tambahan</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Dibuat oleh</span>
              <p className="font-medium text-gray-900">{data.createdBy || '-'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Tanggal dibuat</span>
              <p className="font-medium text-gray-900">{data.createdAt}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.push('/usulan/jalan')}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Kembali ke Dashboard
        </button>
        
        {data.status === 'Pending' && (
          <div className="flex gap-3">
            <button
              className="px-6 py-3 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              Tolak
            </button>
            <button
              className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
            >
              Setujui
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
