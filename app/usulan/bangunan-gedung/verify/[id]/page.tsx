'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Building2, MapPin, FileText, Calendar, User, CheckCircle, XCircle } from 'lucide-react';
import type { UsulanBangunanGedung, VerificationStatus } from '@/types/usulan-bangunan';
import VerificationSequence from '@/components/UsulanBangunan/VerificationSequence';

// Mock data - in production this would come from API
const mockData: UsulanBangunanGedung[] = [
  {
    id: '1',
    jenis: 'Pembangunan',
    uraian: 'Pembangunan Gedung Kantor Dinas Pendidikan 3 Lantai',
    lokasi: 'Jl. Gatot Subroto No. 45, Kota Bandung',
    klasifikasi: 'Gedung Negara Tidak Sederhana',
    satuan: 'm2',
    verificationStatus: {
      opd: 'Disetujui',
      bappeda: 'Disetujui',
      bpkad: 'Disetujui',
    },
    nilaiBkf: 'Sudah',
    sumberPembiayaan: 'APBD',
    status: 'Sukses',
    suratPermohonan: '/easb-document.pdf',
    suratRekomendasi: '/easb-document.pdf',
    createdBy: 'Anggito Anju',
    createdDate: '15-11-2024',
  },
  {
    id: '2',
    jenis: 'Pembangunan',
    uraian: 'Pembangunan Gedung Puskesmas Tipe B',
    lokasi: 'Jl. Ahmad Yani Km 5, Kecamatan Cibiru',
    klasifikasi: 'Gedung Negara Sederhana',
    satuan: 'm2',
    verificationStatus: {
      opd: 'Disetujui',
      bappeda: 'Disetujui',
      bpkad: 'Menunggu',
    },
    nilaiBkf: 'Sudah',
    sumberPembiayaan: 'APBD',
    status: 'Sukses',
    suratPermohonan: '/easb-document.pdf',
    suratRekomendasi: '/easb-document.pdf',
    createdBy: 'Muhammad Ismail',
    createdDate: '20-11-2024',
  },
  {
    id: '3',
    jenis: 'Pembangunan',
    uraian: 'Renovasi dan Perluasan Balai Kota',
    lokasi: 'Jl. Wastukencana No. 2, Bandung Wetan',
    klasifikasi: 'Rumah Negara Tipe A',
    satuan: 'm2',
    verificationStatus: {
      opd: 'Disetujui',
      bappeda: 'Ditolak',
      bpkad: 'Belum',
    },
    nilaiBkf: 'Belum',
    sumberPembiayaan: 'APBN',
    status: 'Tolak',
    suratPermohonan: '/easb-document.pdf',
    createdBy: 'Anggito Anju',
    createdDate: '10-11-2024',
  },
  {
    id: '4',
    jenis: 'Pemeliharaan',
    uraian: 'Rehabilitasi Gedung DPRD 2 Lantai',
    lokasi: 'Jl. Diponegoro No. 10, Bandung',
    klasifikasi: 'Gedung Negara Sederhana',
    satuan: 'm2',
    verificationStatus: {
      opd: 'Menunggu',
      bappeda: 'Belum',
      bpkad: 'Belum',
    },
    nilaiBkf: 'Sedang',
    sumberPembiayaan: 'APBD',
    status: 'Proses',
    suratPermohonan: '/easb-document.pdf',
    createdBy: 'Samarta Admin',
    createdDate: '25-11-2024',
  },
];

export default function VerifyUsulanPage() {
  const router = useRouter();
  const params = useParams();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usulanData, setUsulanData] = useState<UsulanBangunanGedung | null>(null);

  useEffect(() => {
    // Check if user is verificator/verifikator
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const userDataCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('userData='));
        
        if (userDataCookie) {
          const userData = JSON.parse(decodeURIComponent(userDataCookie.split('=')[1]));
          setUserRole(userData.role);
          
          // Redirect if not one of the verificator roles
          const allowedRoles = ['verifikator_opd', 'verifikator_bappeda', 'verifikator_bpkad'];
          if (!allowedRoles.includes(userData.role)) {
            router.push('/usulan/bangunan-gedung');
            return;
          }
        } else {
          // No auth, redirect to login
          router.push('/');
          return;
        }
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    // Load usulan data based on ID
    if (params.id) {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      
      // Try to get from mock data first
      let data = mockData.find(item => item.id === id);
      
      // If not found in mock data, try to get from localStorage (submitted data)
      if (!data) {
        const submittedData = localStorage.getItem('submitted_usulan_list');
        if (submittedData) {
          try {
            const submissions = JSON.parse(submittedData);
            data = submissions.find((item: UsulanBangunanGedung) => item.id === id);
          } catch (e) {
            console.error('Failed to load submitted usulan', e);
          }
        }
      }
      
      setUsulanData(data || null);
      setIsLoading(false);
    }
  }, [params.id]);

  // Don't show anything until auth check is complete
  const allowedRoles = ['verifikator_opd', 'verifikator_bappeda', 'verifikator_bpkad'];
  if (!userRole || !allowedRoles.includes(userRole)) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!usulanData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">Usulan dengan ID tersebut tidak ditemukan.</p>
          <button
            onClick={() => router.push('/usulan/bangunan-gedung')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/usulan/bangunan-gedung')}
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-2 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Daftar Usulan
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Verifikasi Usulan Bangunan</h1>
          <p className="mt-1 text-sm text-gray-500">
            Detail lengkap usulan untuk proses verifikasi
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                usulanData.jenis === 'Pembangunan' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-orange-500 text-white'
              }`}>
                {usulanData.jenis}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                usulanData.status === 'Sukses' ? 'bg-green-100 text-green-800' :
                usulanData.status === 'Proses' ? 'bg-yellow-100 text-yellow-800' :
                usulanData.status === 'Tolak' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {usulanData.status}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{usulanData.uraian}</h2>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{usulanData.lokasi}</span>
            </div>
          </div>
          <Building2 className="w-16 h-16 text-white/20" />
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            Informasi Dasar
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Klasifikasi</label>
              <p className="text-gray-900 mt-1">{usulanData.klasifikasi}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Satuan</label>
              <p className="text-gray-900 mt-1">{usulanData.satuan}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Sumber Pembiayaan</label>
              <p className="text-gray-900 mt-1">
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-purple-50 text-purple-700 text-sm font-medium">
                  {usulanData.sumberPembiayaan}
                </span>
              </p>
            </div>
          </div>
        </div>

      {/* Verification Status Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-teal-600" />
          Status Verifikasi
        </h3>
        <div className="flex items-center justify-center py-4">
          <VerificationSequence
            verificationStatus={usulanData.verificationStatus}
            userRole={userRole}
            usulanId={usulanData.id}
            onStatusChange={(stage, newStatus) => {
              // Update local state
              setUsulanData(prev => prev ? {
                ...prev,
                verificationStatus: {
                  ...prev.verificationStatus,
                  [stage]: newStatus
                }
              } : null);
              // In production, this would call an API to save the change
            }}
          />
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Info:</strong> {userRole === 'verifikator_opd' ? 'Anda dapat mengubah status verifikasi OPD.' :
              userRole === 'verifikator_bappeda' ? 'Anda dapat mengubah status verifikasi BAPPEDA.' :
              userRole === 'verifikator_bpkad' ? 'Anda dapat mengubah status verifikasi BPKAD.' :
              'Anda dapat melihat status verifikasi dari semua tahapan.'}
          </p>
        </div>
      </div>

      {/* Creator Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-teal-600" />
            Informasi Pembuat
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Dibuat Oleh</label>
              <p className="text-gray-900 mt-1">{usulanData.createdBy || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Tanggal Dibuat</label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{usulanData.createdDate || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-600" />
          Dokumen Terlampir
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="text-sm font-medium text-gray-500 mb-2 block">Surat Permohonan</label>
            {usulanData.suratPermohonan ? (
              <a
                href={usulanData.suratPermohonan}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Lihat Dokumen PDF</span>
              </a>
            ) : (
              <p className="text-gray-400">Tidak ada dokumen</p>
            )}
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="text-sm font-medium text-gray-500 mb-2 block">Surat Rekomendasi</label>
            {usulanData.suratRekomendasi ? (
              <a
                href={usulanData.suratRekomendasi}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Lihat Dokumen PDF</span>
              </a>
            ) : (
              <p className="text-gray-400">Tidak ada dokumen</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons - Only for verificators */}
      {(userRole === 'verifikator_opd' || userRole === 'verifikator_bappeda' || userRole === 'verifikator_bpkad') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => {
                const stage = userRole === 'verifikator_opd' ? 'opd' : 
                              userRole === 'verifikator_bappeda' ? 'bappeda' : 'bpkad';
                setUsulanData(prev => prev ? {
                  ...prev,
                  verificationStatus: {
                    ...prev.verificationStatus,
                    [stage]: 'Disetujui'
                  }
                } : null);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
            >
              <CheckCircle className="w-5 h-5" />
              Setujui
            </button>
            <button 
              onClick={() => {
                const stage = userRole === 'verifikator_opd' ? 'opd' : 
                              userRole === 'verifikator_bappeda' ? 'bappeda' : 'bpkad';
                setUsulanData(prev => prev ? {
                  ...prev,
                  verificationStatus: {
                    ...prev.verificationStatus,
                    [stage]: 'Ditolak'
                  }
                } : null);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
            >
              <XCircle className="w-5 h-5" />
              Tolak
            </button>
            <button 
              onClick={() => router.push('/usulan/bangunan-gedung')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Kembali
            </button>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Gunakan tombol di atas untuk approval/reject cepat, atau gunakan dropdown di atas untuk mengubah ke status spesifik (Menunggu, dll.)
          </p>
        </div>
      )}
    </div>
  );
}
