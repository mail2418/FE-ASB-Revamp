'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Building2, MapPin, FileText, Calendar, User, CheckCircle, XCircle, Edit3, Save, X } from 'lucide-react';
import type { UsulanBangunanGedung, VerificationStatus } from '@/types/usulan-bangunan';
import VerificationSequence from '@/components/UsulanBangunan/VerificationSequence';

// Interface for API response
interface APIUsulanBangunan {
  id: number;
  idAsbJenis: number;
  idAsbStatus: number;
  idOpd: number;
  idAsbTipeBangunan: number;
  idKabkota: number;
  idAsbKlasifikasi: number | null;
  tahunAnggaran: number;
  namaAsb: string;
  alamat: string;
  jumlahKontraktor: number;
  totalLantai: number;
  rejectReason: string | null;
  shst: number | null;
  luasTotalBangunan: number | null;
  totalBiayaPembangunan: number | null;
  kabkota: {
    id: number;
    kode: string;
    nama: string;
  };
  asbStatus: {
    id: number;
    status: string;
  };
  asbJenis: {
    id: number;
    jenis: string;
    asb: string;
  };
  opd: {
    id: number;
    opd: string;
    alias: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Map API status to display status
const mapStatus = (asbStatus: { id: number; status: string }): string => {
  const statusMap: { [key: string]: string } = {
    'General Documents': 'Proses',
    'Approved': 'Sukses',
    'Rejected': 'Tolak',
    'Pending': 'Proses',
    'Review': 'Proses',
  };
  return statusMap[asbStatus?.status] || 'Proses';
};

// Transform API data to display format
const transformAPIData = (item: APIUsulanBangunan): UsulanBangunanGedung => {
  return {
    id: item.id.toString(),
    jenis: item.asbJenis?.jenis || 'Pembangunan',
    uraian: item.namaAsb,
    lokasi: item.alamat,
    klasifikasi: item.idAsbKlasifikasi ? `Klasifikasi ${item.idAsbKlasifikasi}` : 'Belum Ditentukan',
    satuan: 'm2',
    verificationStatus: {
      opd: 'Menunggu',
      bappeda: 'Belum',
      bpkad: 'Belum',
    },
    nilaiBkf: item.shst ? 'Sudah' : 'Belum',
    status: mapStatus(item.asbStatus),
    suratPermohonan: '/easb-document.pdf',
    createdBy: item.opd?.opd || 'Unknown',
    createdDate: new Date(item.createdAt).toLocaleDateString('id-ID'),
  };
};

export default function VerifyUsulanPage() {
  const router = useRouter();
  const params = useParams();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usulanData, setUsulanData] = useState<UsulanBangunanGedung | null>(null);
  const [apiData, setApiData] = useState<APIUsulanBangunan | null>(null);
  
  // Editing states
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedUraian, setEditedUraian] = useState('');
  const [editedLokasi, setEditedLokasi] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
          const allowedRoles = ['verifikator_opd', 'verifikator_bappeda', 'verifikator_bpkad', 'verifikator'];
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

  // Fetch data from API
  useEffect(() => {
    const fetchUsulanData = async () => {
      if (!params.id) return;
      
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('No access token found');
          setIsLoading(false);
          return;
        }
        const response = await fetch('/api/usulan/bangunan-gedung/asb', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          const allData: APIUsulanBangunan[] = result.data?.data || result.data || [];
          
          const id = Array.isArray(params.id) ? params.id[0] : params.id;
          const foundItem = allData.find(item => item.id.toString() === id);
          
          if (foundItem) {
            setApiData(foundItem);
            const transformed = transformAPIData(foundItem);
            setUsulanData(transformed);
            setEditedUraian(transformed.uraian);
            setEditedLokasi(transformed.lokasi);
          }
        } else {
          console.error('Failed to fetch data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching usulan data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsulanData();
  }, [params.id]);

  // Handle save summary
  const handleSaveSummary = async () => {
    if (!apiData || !usulanData) return;
    
    setIsSaving(true);
    try {
      // In production, this would call a PUT/PATCH API to update the data
      // For now, we update the local state
      setUsulanData(prev => prev ? {
        ...prev,
        uraian: editedUraian,
        lokasi: editedLokasi,
      } : null);
      
      setIsEditingSummary(false);
      
      // TODO: Call API to save changes
      // const response = await fetch(`/api/usulan/bangunan-gedung/asb/${apiData.id}`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     namaAsb: editedUraian,
      //     alamat: editedLokasi,
      //   }),
      // });
      
      console.log('Summary updated:', { uraian: editedUraian, lokasi: editedLokasi });
    } catch (error) {
      console.error('Error saving summary:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Check if user can edit (verifikator role)
  const canEdit = userRole === 'verifikator' || 
                  userRole === 'verifikator_opd' || 
                  userRole === 'verifikator_bappeda' || 
                  userRole === 'verifikator_bpkad';

  // Don't show anything until auth check is complete
  const allowedRoles = ['verifikator_opd', 'verifikator_bappeda', 'verifikator_bpkad', 'verifikator'];
  if (!userRole || !allowedRoles.includes(userRole)) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
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

      {/* Summary Card - Editable for verifikator */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg shadow-lg p-6 text-white relative">
        {canEdit && !isEditingSummary && (
          <button
            onClick={() => setIsEditingSummary(true)}
            className="absolute top-4 right-4 p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            title="Edit Summary"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        )}
        
        {isEditingSummary ? (
          <div className="space-y-4">
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
            
            <div>
              <label className="text-sm text-white/80 mb-1 block">Nama/Uraian Bangunan</label>
              <input
                type="text"
                value={editedUraian}
                onChange={(e) => setEditedUraian(e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-white/80 mb-1 block">Lokasi/Alamat</label>
              <input
                type="text"
                value={editedLokasi}
                onChange={(e) => setEditedLokasi(e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSaveSummary}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-teal-600 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                onClick={() => {
                  setIsEditingSummary(false);
                  setEditedUraian(usulanData.uraian);
                  setEditedLokasi(usulanData.lokasi);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-medium"
              >
                <X className="w-4 h-4" />
                Batal
              </button>
            </div>
          </div>
        ) : (
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
        )}
      </div>

      {/* Extended Information from API */}
      {apiData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            Detail Bangunan
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Tahun Anggaran</p>
              <p className="text-lg font-semibold text-gray-900">{apiData.tahunAnggaran}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Total Lantai</p>
              <p className="text-lg font-semibold text-gray-900">{apiData.totalLantai} Lantai</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Jumlah Kontraktor</p>
              <p className="text-lg font-semibold text-gray-900">{apiData.jumlahKontraktor}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Kab/Kota</p>
              <p className="text-lg font-semibold text-gray-900">{apiData.kabkota?.nama || '-'}</p>
            </div>
            {apiData.luasTotalBangunan && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Luas Total</p>
                <p className="text-lg font-semibold text-gray-900">{apiData.luasTotalBangunan} m²</p>
              </div>
            )}
            {apiData.totalBiayaPembangunan && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Biaya</p>
                <p className="text-lg font-semibold text-gray-900">
                  Rp {apiData.totalBiayaPembangunan.toLocaleString('id-ID')}
                </p>
              </div>
            )}
            {apiData.shst && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">SHST</p>
                <p className="text-lg font-semibold text-gray-900">
                  Rp {apiData.shst.toLocaleString('id-ID')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

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
              <label className="text-sm font-medium text-gray-500">OPD</label>
              <p className="text-gray-900 mt-1">{apiData?.opd?.opd || '-'}</p>
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
              userRole === 'verifikator' ? 'Anda dapat mengedit summary dan melihat status verifikasi.' :
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
      {(userRole === 'verifikator_opd' || userRole === 'verifikator_bappeda' || userRole === 'verifikator_bpkad' || userRole === 'verifikator') && (
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
