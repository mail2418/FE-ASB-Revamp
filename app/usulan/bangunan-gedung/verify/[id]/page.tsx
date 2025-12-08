'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Building2, MapPin, FileText, Calendar, User, CheckCircle, XCircle, Layers, CheckCircle2 } from 'lucide-react';
import type { UsulanBangunanGedung } from '@/types/usulan-bangunan';

// Interface for API response
interface AsbDetail {
  id: number;
  idAsb: number;
  files: string;
  idAsbLantai: number;
  idAsbFungsiRuang: number;
  asbFungsiRuangKoef: number;
  lantaiKoef: number;
  luas: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface AsbBipekStandard {
  id: number;
  idAsb: number;
  files: string;
  idAsbKomponenBangunanStd: number;
  bobotInput: number;
  calculationMethod: string;
  jumlahBobot: number;
  rincianHarga: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface AsbBipekNonStd {
  id: number;
  idAsb: number;
  files: string;
  idAsbKomponenBangunanNonStd: number;
  bobotInput: number;
  calculationMethod: string;
  jumlahBobot: number;
  rincianHarga: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface APIUsulanBangunan {
  id: number;
  idAsbJenis: number;
  idAsbStatus: number;
  idOpd: number;
  idAsbTipeBangunan: number;
  idRekening: number | null;
  idRekeningReview: number | null;
  idKabkota: number;
  idAsbKlasifikasi: number | null;
  idVerifikatorAdpem: number | null;
  idVerifikatorBappeda: number | null;
  idVerifikatorBpkad: number | null;
  tahunAnggaran: number;
  namaAsb: string;
  alamat: string;
  jumlahKontraktor: number;
  totalLantai: number;
  luasTanah: number | null;
  rejectReason: string | null;
  shst: number | null;
  perencanaanKonstruksi: number | null;
  pengawasanKonstruksi: number | null;
  managementKonstruksi: number | null;
  pengelolaanKegiatan: number | null;
  luasTotalBangunan: number | null;
  koefisienLantaiTotal: number | null;
  koefisienFungsiRuangTotal: number | null;
  totalBiayaPembangunan: number | null;
  nominalBps: string | null;
  nominalBpns: string | null;
  bobotTotalBps: string | null;
  bobotTotalBpns: string | null;
  rekapitulasiBiayaKonstruksi: number | null;
  rekapitulasiBiayaKonstruksiRounded: number | null;
  kabkota: {
    id: number;
    kode: string;
    nama: string;
    provinceId?: number;
    isActive?: boolean;
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
    id_user?: number;
  };
  asbTipeBangunan: {
    id: number;
    tipe_bangunan: string;
  };
  asbKlasifikasi: {
    id: number;
    id_asb_tipe_bangunan: number;
    klasifikasi: string;
  } | null;
  verifikatorAdpem: any;
  verifikatorBPKAD: any;
  verifikatorBappeda: any;
  asbDetails: AsbDetail[];
  asbDetailReviews: any[];
  asbBipekStandards: AsbBipekStandard[];
  asbBipekStandardReviews: any[];
  asbBipekNonStds: AsbBipekNonStd[];
  asbBipekNonStdReviews: any[];
  rekening: any;
  rekeningReview: any;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Mapping for lantai names
const LANTAI_MAP: { [key: number]: string } = {
  1: 'Lantai 1',
  2: 'Lantai 2',
  3: 'Lantai 3',
  4: 'Lantai 4',
  5: 'Lantai 5',
  6: 'Lantai 6',
  7: 'Lantai 7',
  8: 'Lantai 8',
  9: 'Lantai 9',
  10: 'Lantai 10',
};

// Mapping for fungsi ruang names
const FUNGSI_RUANG_MAP: { [key: number]: string } = {
  1: 'Ruang Kantor',
  2: 'Ruang Rapat',
  3: 'Ruang Arsip',
  4: 'Gudang',
  5: 'Toilet',
  6: 'Lobby',
  7: 'Parkir',
  8: 'Ruang Lainnya',
};

const STATUS_ID_MAP: { [key: number]: string } = {
  1: 'General Documents',
  2: 'Luas Total Bangunan (LTB), Koefesien Luas Bangunan (KLB) dan Koefesien Fungsi Bangunan (KFB)',
  3: 'Kebutuhan Biaya Pekerjaan Standar (BPS)',
  4: 'Kebutuhan Biaya Pekerjaan Non Standar (BPNS)',
  5: 'Setup Rekening',
  6: 'Proses Verifikasi',
  7: 'Tidak Memenuhi Syarat',
  8: 'Memenuhi Syarat',
  9: 'Verifikasi Luas Total Bangunan (LTB), Koefesien Luas Bangunan (KLB) dan Koefesien Fungsi Bangunan (KFB)',
  10: 'Verifikasi Kebutuhan Biaya Pekerjaan Standart (BPS)',
  11: 'Verifikasi Kebutuhan Biaya Pekerjaan Non Standar (BPNS)',
  12: 'Verifikasi Rekening Belanja',
  13: 'Verifikasi Biaya Pekerjaan',
};

// Transform API data to display format
const transformAPIData = (item: APIUsulanBangunan): UsulanBangunanGedung => {
  return {
    id: item.id.toString(),
    jenis: item.asbJenis?.jenis || 'Pembangunan',
    uraian: item.namaAsb,
    lokasi: item.alamat,
    klasifikasi: item.asbKlasifikasi?.klasifikasi || 'Belum Ditentukan',
    satuan: 'm2',
    verificationStatus: {
      adpem: item.idVerifikatorAdpem ? 'Disetujui' : 'Menunggu',
      bappeda: item.idVerifikatorBappeda ? 'Disetujui' : 'Belum',
      bpkad: item.idVerifikatorBpkad ? 'Disetujui' : 'Belum',
    },
    nilaiBkf: item.shst ? 'Sudah' : 'Belum',
    createdBy: item.opd?.opd || 'Unknown',
    createdDate: new Date(item.createdAt).toLocaleDateString('id-ID'),
  };
};

export default function VerifyUsulanPage() {
  const router = useRouter();
  const params = useParams();

  const [userRole, setUserRole] = useState<string | null>(null);
  const [jenisVerifikator, setJenisVerifikator] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usulanData, setUsulanData] = useState<UsulanBangunanGedung | null>(null);
  const [apiData, setApiData] = useState<APIUsulanBangunan | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // Handler for Verifikasi Lantai API call
  const handleVerifikasiLantai = async () => {
    if (!apiData) return;
    setIsVerifying(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        return;
      }
      const requestBody = {
        id_asb: apiData.id,
        verif_luas_lantai: [100.5, 95.3, 90.2],
        verif_id_asb_lantai: [1, 2, 3],
        verif_id_asb_fungsi_ruang: [1, 2, 3]
      };
      const response = await fetch('/api/usulan/bangunan-gedung/asb/verif-lantai', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal verifikasi lantai');
      }

      alert('Verifikasi Lantai berhasil!');
      window.location.reload();
    } catch (error) {
      console.error('Error verifikasi lantai:', error);
      alert(`Gagal verifikasi: ${error instanceof Error ? error.message : 'Terjadi kesalahan'}`);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handler for Verifikasi Rekening API call
  const handleVerifikasiRekening = async () => {
    if (!apiData) return;
    setIsVerifying(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        return;
      }

      const response = await fetch('/api/usulan/bangunan-gedung/asb/verif-rekening', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id_asb: apiData.id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal verifikasi rekening');
      }

      alert('Verifikasi Rekening Belanja berhasil!');
      window.location.reload();
    } catch (error) {
      console.error('Error verifikasi rekening:', error);
      alert(`Gagal verifikasi: ${error instanceof Error ? error.message : 'Terjadi kesalahan'}`);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handler for Tolak (Reject) API call
  const handleReject = async () => {
    if (!apiData) return;
    if (!rejectReason.trim()) {
      alert('Mohon masukkan alasan penolakan.');
      return;
    }
    setIsVerifying(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        return;
      }

      const response = await fetch('/api/usulan/bangunan-gedung/asb/reject', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          id_asb: apiData.id,
          reject_reason: rejectReason 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal menolak usulan');
      }

      alert('Usulan berhasil ditolak!');
      setShowRejectModal(false);
      setRejectReason('');
      window.location.reload();
    } catch (error) {
      console.error('Error rejecting:', error);
      alert(`Gagal menolak: ${error instanceof Error ? error.message : 'Terjadi kesalahan'}`);
    } finally {
      setIsVerifying(false);
    }
  };

  // State for document viewing
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);

  // Handler for viewing Surat Permohonan
  const handleViewSuratPermohonan = async () => {
    if (!apiData) return;
    setIsLoadingDocument(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        return;
      }

      const response = await fetch(`/api/usulan/bangunan-gedung/document/download-surat-permohonan?idAsb=${apiData.id}&view=true`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal memuat dokumen');
      }

      const data = await response.json();
      // Open the document URL in a new tab
      if (data.data?.url || data.url) {
        window.open(data.data?.url || data.url, '_blank');
      } else {
        alert('URL dokumen tidak ditemukan');
      }
    } catch (error) {
      console.error('Error viewing surat permohonan:', error);
      alert(`Gagal memuat dokumen: ${error instanceof Error ? error.message : 'Terjadi kesalahan'}`);
    } finally {
      setIsLoadingDocument(false);
    }
  };

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
          
          // Get verifikator type from localStorage
          const verifikatorInfo = localStorage.getItem('verifikatorInfo');

          if (verifikatorInfo) {
            setJenisVerifikator(verifikatorInfo);
          }

          // Redirect if not one of the verificator roles
          const allowedRoles = ['verifikator'];
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

  console.log(jenisVerifikator)
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

        const response = await fetch(`/api/usulan/bangunan-gedung/asb?idAsb=${params.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          const allData: APIUsulanBangunan = result.data?.data || result.data;
          
          console.log(allData)

          if (allData) {
            setApiData(allData);
            const transformed = transformAPIData(allData);
            setUsulanData(transformed);
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

  // Don't show anything until auth check is complete
  const allowedRoles = ['verifikator'];
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


      {/* Grid Layout similar to summary page */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Classification & Financial Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Classification Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-6 h-6 text-teal-600" />
              <h2 className="text-lg font-semibold text-gray-900">Klasifikasi</h2>
            </div>
            <div className="space-y-3">
              <div className="bg-lime-100 text-lime-800 px-4 py-2 rounded-lg text-center font-medium">
                {apiData?.asbKlasifikasi?.klasifikasi || '[Belum terklasifikasi]'}
              </div>
              <div className="text-sm text-gray-600 text-center">
                Jenis Bangunan: <span className="font-medium">{apiData?.asbJenis?.jenis || '-'}</span>
              </div>
              <div className="text-sm text-gray-600 text-center">
                Tipe Usulan: <span className="font-medium">{apiData?.asbTipeBangunan?.tipe_bangunan || '-'}</span>
              </div>
            </div>
          </div>

          {/* Financial Info Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Nilai SHST per (m²)</label>
                <div className="bg-lime-100 text-lime-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                  Rp {apiData?.shst ? Number(apiData.shst).toLocaleString('id-ID') : '0'} / m²
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Luas Total Bangunan</label>
                <div className="bg-lime-100 text-lime-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                  {apiData?.asbDetails?.reduce((sum, d) => sum + (d.luas || 0), 0).toFixed(0) || '0'} m²
                </div>
              </div>

              {apiData?.luasTanah && (
                <div>
                  <label className="text-sm text-gray-600">Luas Tanah</label>
                  <div className="bg-lime-100 text-lime-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                    {apiData.luasTanah} m²
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location & Budget Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Kabupaten/Kota</label>
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                  {apiData?.kabkota?.nama || '-'}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Tahun Anggaran</label>
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                  {apiData?.tahunAnggaran || '-'}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Jumlah Lantai</label>
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                  {apiData?.totalLantai || 0} Lantai
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">OPD</label>
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                  {apiData?.opd?.opd || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Building Info Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-teal-600" />
              <h2 className="text-lg font-semibold text-gray-900">Informasi Bangunan</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Deskripsi Bangunan</label>
                <p className="text-gray-900 font-medium mt-1">{apiData?.namaAsb || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Lokasi</label>
                <p className="text-gray-900 font-medium mt-1">{apiData?.alamat || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Dibuat Oleh</label>
                <p className="text-gray-900 font-medium mt-1">{apiData?.opd?.opd || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Tanggal Dibuat</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{apiData ? new Date(apiData.createdAt).toLocaleDateString('id-ID') : '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Floors Table */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Layers className="w-6 h-6 text-teal-600" />
              <h2 className="text-lg font-semibold text-gray-900">Detail Lantai ({apiData?.asbDetails?.length || 0} Lantai)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Lantai</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Luas</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fungsi</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Koefisien</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {apiData?.asbDetails && apiData.asbDetails.length > 0 ? apiData.asbDetails.map((detail) => (
                    <tr key={detail.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {LANTAI_MAP[detail.idAsbLantai] || `Lantai ${detail.idAsbLantai}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{detail.luas} m²</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {FUNGSI_RUANG_MAP[detail.idAsbFungsiRuang] || `Fungsi ${detail.idAsbFungsiRuang}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{detail.lantaiKoef?.toFixed(4)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        Belum ada data lantai
                      </td>
                    </tr>
                  )}
                </tbody>
                {apiData?.asbDetails && apiData.asbDetails.length > 0 && (
                  <tfoot className="bg-gray-50 border-t">
                    <tr>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">Total</td>
                      <td className="px-4 py-3 text-sm font-semibold text-teal-600">
                        {apiData.asbDetails.reduce((sum, d) => sum + (d.luas || 0), 0).toFixed(0)} m²
                      </td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Components Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Components */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-3">
                Komponen Standar ({apiData?.asbBipekStandards?.filter(c => c.bobotInput > 0).length || 0})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {apiData?.asbBipekStandards && apiData.asbBipekStandards.filter(c => c.bobotInput > 0).length > 0 ? 
                  apiData.asbBipekStandards.filter(c => c.bobotInput > 0).map((comp) => (
                    <div key={comp.id} className="flex justify-between items-center text-sm py-1 border-b border-gray-100 last:border-0">
                      <span className="text-gray-600">Komponen #{comp.idAsbKomponenBangunanStd}</span>
                      <span className="font-semibold text-teal-600">{comp.bobotInput}%</span>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 text-center py-4">Belum ada komponen standar</p>
                  )}
              </div>
              {apiData?.asbBipekStandards && apiData.asbBipekStandards.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Total Bobot</span>
                    <span className="font-semibold text-teal-600">
                      {apiData.asbBipekStandards.reduce((sum, c) => sum + (c.bobotInput || 0), 0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Non-Standard Components */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-3">
                Komponen Non-Standar ({apiData?.asbBipekNonStds?.filter(c => c.bobotInput > 0).length || 0})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {apiData?.asbBipekNonStds && apiData.asbBipekNonStds.filter(c => c.bobotInput > 0).length > 0 ? 
                  apiData.asbBipekNonStds.filter(c => c.bobotInput > 0).map((comp) => (
                    <div key={comp.id} className="flex justify-between items-center text-sm py-1 border-b border-gray-100 last:border-0">
                      <span className="text-gray-600">Komponen #{comp.idAsbKomponenBangunanNonStd}</span>
                      <span className="font-semibold text-orange-600">{comp.bobotInput}%</span>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 text-center py-4">Tidak ada komponen non-standar</p>
                  )}
              </div>
              {apiData?.asbBipekNonStds && apiData.asbBipekNonStds.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Total Bobot</span>
                    <span className="font-semibold text-orange-600">
                      {apiData.asbBipekNonStds.reduce((sum, c) => sum + (c.bobotInput || 0), 0)}%
                    </span>
                  </div>
                </div>
              )}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Surat Permohonan */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="text-sm font-medium text-gray-500 mb-2 block">Surat Permohonan</label>
            <button
              onClick={handleViewSuratPermohonan}
              disabled={isLoadingDocument}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingDocument ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span>Lihat Dokumen PDF</span>
            </button>
          </div>
        
          {/* Surat Rekomendasi */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="text-sm font-medium text-gray-500 mb-2 block">Surat Rekomendasi</label>
            {apiData && apiData.asbStatus?.id === 8 && 
             apiData.idVerifikatorAdpem !== null && 
             apiData.idVerifikatorBappeda !== null && 
             apiData.idVerifikatorBpkad !== null ? (
              <button
                onClick={() => console.log('View Surat Rekomendasi')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Lihat Dokumen PDF</span>
              </button>
            ) : (
              <p className="text-gray-400 text-sm">Menunggu verifikasi lengkap dari 3 verifikator</p>
            )}
          </div>
        </div>
      </div>

      {/* ADPEM Verification Navigation - Only for ADPEM verifikator */}
      {jenisVerifikator === 'ADPEM' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Verifikasi Komponen Bangunan</h3>
              <p className="text-sm text-blue-600">Khusus Verifikator ADPEM</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Sebagai ADPEM, Anda dapat melakukan verifikasi pada komponen standar dan non-standar bangunan. Klik salah satu tombol di bawah untuk melihat dan memverifikasi data komponen.
          </p>
          <div className="flex flex-wrap gap-3">
            {/* Verifikasi Lantai - only enabled when idAsbStatus is 6 */}
            <button 
              onClick={handleVerifikasiLantai}
              disabled={!apiData || apiData.asbStatus?.id !== 6 || isVerifying}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title={apiData?.asbStatus?.id !== 6 ? 'Hanya dapat diakses saat status adalah Proses Verifikasi (6)' : ''}
            >
              {isVerifying ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
              Verifikasi Lantai
            </button>
            
            <button 
              onClick={() => router.push(`/usulan/bangunan-gedung/verify/${params.id}/input-komponen-standar-bangunan`)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm cursor-pointer"
            >
              <CheckCircle className="w-5 h-5" />
              Menuju Ke Komponen Standar
            </button>
            <button 
              onClick={() => router.push(`/usulan/bangunan-gedung/verify/${params.id}/input-komponen-standar-non-bangunan`)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm cursor-pointer"
            >
              <CheckCircle className="w-5 h-5" />
              Menuju Ke Komponen Non-Standar
            </button>
            
            {/* Verifikasi Rekening Belanja - only enabled when idAsbStatus is 11 */}
            <button 
              onClick={handleVerifikasiRekening}
              disabled={!apiData || apiData.asbStatus?.id !== 11 || isVerifying}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title={apiData?.asbStatus?.id !== 11 ? 'Hanya dapat diakses saat status adalah Verifikasi BPNS (11)' : ''}
            >
              {isVerifying ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
              Verifikasi Rekening Belanja
            </button>
          </div>
          <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Info:</strong> Tombol navigasi ini hanya tersedia untuk verifikator ADPEM. BAPPEDA dan BPKAD tidak memiliki akses ke halaman verifikasi komponen.
            </p>
          </div>
          {apiData && (
            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Status ID Saat Ini:</strong> {apiData.asbStatus?.id || apiData.idAsbStatus} - 
                Verifikasi Lantai aktif saat status 6, Rekening Belanja aktif saat status 11.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons - Only for verificators */}
      {(userRole === 'verifikator') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Aksi Verifikasi {jenisVerifikator ? `(${jenisVerifikator})` : ''}
          </h3>
          
          {/* Status Info */}
          {apiData && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Status Saat Ini:</strong> {STATUS_ID_MAP[apiData.asbStatus?.id || apiData.idAsbStatus] || 'Unknown'}
              </p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-3">
            {/* Setujui Button - Only enabled when idAsbStatus is 13 or 8 AND corresponding verifikator field is null */}
            <button 
              onClick={() => {
                console.log('Setujui clicked');
                // TODO: Call API to approve
              }}
              disabled={
                !apiData ||
                (apiData.asbStatus?.id !== 13 && apiData.asbStatus?.id !== 8) ||
                (jenisVerifikator === 'ADPEM' && apiData.idVerifikatorAdpem !== null) ||
                (jenisVerifikator === 'BAPPEDA' && apiData.idVerifikatorBappeda !== null) ||
                (jenisVerifikator === 'BPKAD' && apiData.idVerifikatorBpkad !== null)
              }
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-5 h-5" />
              Setujui
            </button>
            
            {/* Tolak Button - For BAPPEDA and BPKAD, only enabled when idAsbStatus is 13 or 8 */}
            <button 
              onClick={() => setShowRejectModal(true)}
              disabled={
                !apiData ||
                isVerifying ||
                ((jenisVerifikator === 'BAPPEDA' || jenisVerifikator === 'BPKAD') && 
                 apiData.asbStatus?.id !== 13 && apiData.asbStatus?.id !== 8)
              }
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
          
          {/* Info text based on button states */}
          <div className="mt-3 space-y-2">
            {apiData && apiData.asbStatus?.id !== 13 && apiData.asbStatus?.id !== 8 && (
              <p className="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                <strong>Info:</strong> Tombol Setujui dan Tolak hanya aktif jika status adalah "Verifikasi Biaya Pekerjaan" (13) atau "Memenuhi Syarat" (8).
              </p>
            )}
            {jenisVerifikator === 'ADPEM' && apiData?.idVerifikatorAdpem && (
              <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                <strong>Info:</strong> Anda sudah melakukan verifikasi pada usulan ini.
              </p>
            )}
            {jenisVerifikator === 'BAPPEDA' && apiData?.idVerifikatorBappeda && (
              <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                <strong>Info:</strong> Anda sudah melakukan verifikasi pada usulan ini.
              </p>
            )}
            {jenisVerifikator === 'BPKAD' && apiData?.idVerifikatorBpkad && (
              <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                <strong>Info:</strong> Anda sudah melakukan verifikasi pada usulan ini.
              </p>
            )}
            <p className="text-xs text-gray-500">
              {jenisVerifikator === 'ADPEM' 
                ? 'Gunakan tombol di atas untuk verifikasi, atau navigasi ke halaman komponen untuk verifikasi detail.'
                : 'Gunakan tombol di atas untuk approval/reject.'}
            </p>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tolak Usulan
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Masukkan alasan penolakan untuk usulan ini:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Alasan penolakan..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                disabled={isVerifying || !rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? 'Memproses...' : 'Tolak Usulan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
