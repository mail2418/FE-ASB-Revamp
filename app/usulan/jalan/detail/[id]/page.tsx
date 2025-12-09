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
  Ruler,
  Edit2,
  Loader2
} from 'lucide-react';

// Verification status types
type VerificationStatus = 'Belum' | 'Disetujui' | 'Ditolak' | 'Menunggu';

interface VerificationStages {
  adbang: VerificationStatus;
  bappeda: VerificationStatus;
  bpkad: VerificationStatus;
}

// Interface for Jalan form data
interface UsulanJalanDetail {
  id: string;
  jenisUsulan: 'Pemeliharaan' | 'Pembuatan';
  lebarJalan: string;
  strukturPerkerasan: string;
  repetisiBeban: string;
  nilaiCBR: string;
  spesifikasiDesain: string;
  mutuBeton?: string;
  ruangLingkup: string[];
  keteranganTambahan: string;
  verificationStatus: VerificationStages;
  createdAt: string;
  createdBy?: string;
}

// Mock data with 3-stage verification - fallback when localStorage is empty
const mockDataMap: { [key: string]: UsulanJalanDetail } = {
  'mock-1': {
    id: 'mock-1',
    jenisUsulan: 'Pembuatan',
    lebarJalan: '5',
    strukturPerkerasan: 'lentur',
    repetisiBeban: '10',
    nilaiCBR: '6',
    spesifikasiDesain: 'bagan_3',
    ruangLingkup: ['Perkerasan Aspal', 'Lapis Pondasi', 'Galian Tanah'],
    keteranganTambahan: 'Tebal galian 30 cm',
    verificationStatus: {
      adbang: 'Disetujui',
      bappeda: 'Disetujui',
      bpkad: 'Disetujui',
    },
    createdAt: '2024-11-15',
    createdBy: 'Anggito Anju',
  },
  'mock-2': {
    id: 'mock-2',
    jenisUsulan: 'Pemeliharaan',
    lebarJalan: '7',
    strukturPerkerasan: 'kaku',
    repetisiBeban: '15',
    nilaiCBR: '8',
    spesifikasiDesain: 'bagan_4',
    mutuBeton: "fc_25",
    ruangLingkup: ['Perkerasan Beton', 'Lapis Pondasi', 'Pemadatan Tanah', 'Marka dan Rambu Jalan'],
    keteranganTambahan: 'Tebal timbunan 50 cm',
    verificationStatus: {
      adbang: 'Disetujui',
      bappeda: 'Menunggu',
      bpkad: 'Belum',
    },
    createdAt: '2024-11-20',
    createdBy: 'Muhammad Ismail',
  },
  'mock-3': {
    id: 'mock-3',
    jenisUsulan: 'Pembuatan',
    lebarJalan: '4',
    strukturPerkerasan: 'lentur',
    repetisiBeban: '5',
    nilaiCBR: '4',
    spesifikasiDesain: 'bagan_3a',
    ruangLingkup: ['Perkerasan Aspal', 'Galian Tanah', 'Timbunan Tanah'],
    keteranganTambahan: 'Tebal urugan 20 cm',
    verificationStatus: {
      adbang: 'Disetujui',
      bappeda: 'Ditolak',
      bpkad: 'Belum',
    },
    createdAt: '2024-11-10',
    createdBy: 'Samarta Admin',
  },
};

// Verification badge component
const VerificationBadge = ({ status, label }: { status: VerificationStatus; label: string }) => {
  const config = {
    Belum: { bg: 'bg-gray-100', text: 'text-gray-600', icon: <Clock className="w-4 h-4" /> },
    Menunggu: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" /> },
    Disetujui: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
    Ditolak: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-4 h-4" /> },
  };
  const c = config[status] || config.Menunggu;
  
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${c.bg}`}>
      {c.icon}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-sm font-medium ${c.text}`}>{status}</p>
      </div>
    </div>
  );
};

// Format functions
const formatStruktur = (s: string): string => {
  if (s === 'lentur') return 'Perkerasan Lentur';
  if (s === 'kaku') return 'Perkerasan Kaku';
  return s;
};

const formatSpesifikasi = (s: string): string => {
  const map: { [key: string]: string } = {
    'bagan_3': 'Bagan Desain 3 : Opsi Biaya Minimum dengan CTB',
    'bagan_3a': 'Bagan Desain 3A : Opsi Biaya Minimum dengan HRS',
    'bagan_3b': 'Bagan Desain 3B : Aspal dengan Lapis Fondasi Berbutir',
    'bagan_3c': 'Bagan Desain 3C : Penyesuaian LPA pada Bagan Desain 3B untuk Tanah Dasar CBR ≥ 7%',
    'bagan_4': 'Bagan Desain 4 : Perkerasan Kaku untuk Beban Lalu Lintas Berat',
    'bagan_4a': 'Bagan Desain 4A : Perkerasan Kaku untuk Beban Lalu Lintas Ringan',
  };
  return map[s] || s;
};

const formatMutuBeton = (s: string | undefined): string => {
  if (!s) return '-';
  const map: { [key: string]: string } = {
    'fc_20': "f'c 20 Mpa",
    'fc_25': "f'c 25 Mpa",
  };
  return map[s] || s;
};

export default function DetailUsulanJalanPage() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<UsulanJalanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    // Get user role
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUserRole(parsed.role || '');
      } catch (e) {
        console.error('Error parsing userData:', e);
      }
    }

    // Load data from localStorage first, then fallback to mock
    const id = params.id as string;
    let foundItem: UsulanJalanDetail | null = null;
    
    // Try localStorage first
    const storedData = localStorage.getItem('usulan_jalan_submissions');
    if (storedData) {
      try {
        const submissions: UsulanJalanDetail[] = JSON.parse(storedData);
        foundItem = submissions.find(item => item.id === id) || null;
      } catch (e) {
        console.error('Error parsing stored data:', e);
      }
    }
    
    // Fallback to mock data
    if (!foundItem) {
      foundItem = mockDataMap[id] || null;
    }
    
    setData(foundItem);
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
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
        {userRole === 'opd' && (
          <button
            onClick={() => router.push(`/usulan/jalan/edit/${data.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        )}
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
          {/* Verification Status Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Status Verifikasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <VerificationBadge status={data.verificationStatus.adbang} label="ADBANG" />
              <VerificationBadge status={data.verificationStatus.bappeda} label="BAPPEDA" />
              <VerificationBadge status={data.verificationStatus.bpkad} label="BPKAD" />
            </div>
          </div>

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
              <p className="text-lg font-semibold text-gray-900">{data.lebarJalan} m</p>
            </div>

            {/* Struktur Perkerasan */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Layers className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide font-medium">Struktur Perkerasan</span>
              </div>
              <span className={`inline-flex px-3 py-1 rounded text-sm font-medium ${
                data.strukturPerkerasan === 'lentur' || data.strukturPerkerasan === 'Perkerasan Lentur'
                  ? 'bg-indigo-100 text-indigo-800' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {formatStruktur(data.strukturPerkerasan)}
              </span>
            </div>

            {/* Mutu Beton (if applicable) */}
            {data.mutuBeton && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Settings className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide font-medium">Mutu Beton</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{formatMutuBeton(data.mutuBeton)}</p>
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
            <p className="text-teal-800 font-medium">{formatSpesifikasi(data.spesifikasiDesain)}</p>
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
      </div>
    </div>
  );
}
