'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, FileText, Save, X, Building2 } from 'lucide-react';

// Interface for ASB BPS component from API
interface AsbBipekStandard {
  id: number;
  idAsb: number;
  idAsbKomponenBangunanStd: number;
  bobotInput: number;
  calculationMethod: string;
  jumlahBobot: number;
  rincianHarga: number;
  komponenBangunan?: {
    id: number;
    komponen: string;
  };
}

// Interface for stored ASB data
interface StoredAsbData {
  id: number;
  namaAsb: string;
  alamat: string;
  shst: number | null;
  nominalBps: string | null;
  nominalBpns: string | null;
  asbKlasifikasi: {
    id: number;
    klasifikasi: string;
  } | null;
  asbStatus: {
    id: number;
    status: string;
  } | null;
  asbBipekStandards: AsbBipekStandard[];
}

interface RowState {
  percentage: number;
  checked?: boolean;
}

export default function VerifyKomponenStandarPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifyingBPS, setIsVerifyingBPS] = useState(false);
  const [jenisVerifikator, setJenisVerifikator] = useState<string | null>(null);
  const [asbData, setAsbData] = useState<StoredAsbData | null>(null);
  const [components, setComponents] = useState<AsbBipekStandard[]>([]);
  const [formState, setFormState] = useState<{ [key: string]: RowState }>({});
  const [verificationNotes, setVerificationNotes] = useState('');
  const [idAsbStatus, setIdAsbStatus] = useState<number | null>(null);

  // Handler for Verifikasi BPS API call
  const handleVerifikasiBPS = async () => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!id) return;
    setIsVerifyingBPS(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        return;
      }
      const requestBody = { 
          id_asb: parseInt(id),
          verif_komponen_std: components.map((comp) => comp.id),
          verif_bobot_acuan_std: components.map((comp) => comp.bobotInput),
      }
      console.log(requestBody)
      const response = await fetch('/api/usulan/bangunan-gedung/asb/verif-bps', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal verifikasi BPS');
      }

      alert('Verifikasi BPS berhasil!');
      router.push(`/usulan/bangunan-gedung/verify/${id}`);
    } catch (error) {
      console.error('Error verifikasi BPS:', error);
      alert(`Gagal verifikasi: ${error instanceof Error ? error.message : 'Terjadi kesalahan'}`);
    } finally {
      setIsVerifyingBPS(false);
    }
  };

  // Check authorization - only ADBANG can access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const verifikatorInfo = localStorage.getItem('verifikatorInfo');
      if (verifikatorInfo) {
        setJenisVerifikator(verifikatorInfo);
        
        // Only ADBANG can access this page
        if (verifikatorInfo !== 'ADBANG') {
          router.push(`/usulan/bangunan-gedung/verify/${params.id}`);
          return;
        }
      } else {
        router.push('/');
        return;
      }
    }
  }, [router, params.id]);

  // Load data from localStorage (stored by parent verify page)
  useEffect(() => {
    const loadStoredData = () => {
      setIsLoading(true);
      try {
        const storedData = localStorage.getItem('verify_asb_data');
        
        if (storedData) {
          const parsed: StoredAsbData = JSON.parse(storedData);
          console.log('Loaded ASB data from localStorage:', parsed);
          setAsbData(parsed);
          
          // Get idAsbStatus
          if (parsed.asbStatus?.id) {
            setIdAsbStatus(parsed.asbStatus.id);
          }
          
          // Set components from asbBipekStandards
          if (parsed.asbBipekStandards && parsed.asbBipekStandards.length > 0) {
            setComponents(parsed.asbBipekStandards);
            
            // Initialize form state with existing values
            const initialState: { [key: string]: RowState } = {};
            parsed.asbBipekStandards.forEach((comp) => {
              initialState[`row_${comp.id}`] = {
                percentage: comp.bobotInput || 0,
                checked: (comp.bobotInput || 0) > 0,
              };
            });
            setFormState(initialState);
          }
        } else {
          console.warn('No verify_asb_data found in localStorage');
        }
      } catch (error) {
        console.error('Error loading stored data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, [params.id]);

  if (jenisVerifikator !== 'ADBANG') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Memuat data komponen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push(`/usulan/bangunan-gedung/verify/${params.id}`)}
          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-2 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Detail Usulan
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Verifikasi Komponen Standar</h1>
        <p className="mt-1 text-sm text-gray-500">
          Verifikasi komponen standar bangunan (hanya lihat, tidak bisa edit)
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Mode Verifikasi (ADBANG)</p>
            <p className="text-sm text-blue-700 mt-1">
              Anda sedang dalam mode verifikasi. Data komponen ditampilkan untuk review. 
              Klik tombol "Verifikasi" di bawah untuk menyetujui data komponen standar.
            </p>
          </div>
        </div>
      </div>

      {/* Building Information Section */}
      {asbData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-6 h-6 text-teal-600" />
            <h2 className="text-lg font-semibold text-gray-900">Informasi Bangunan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600">Nama Bangunan</label>
              <p className="text-gray-900 font-medium mt-1">{asbData.namaAsb || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Klasifikasi</label>
              <div className="mt-1">
                <span className="inline-flex px-3 py-1 bg-lime-100 text-lime-800 rounded-lg text-sm font-medium">
                  {asbData.asbKlasifikasi?.klasifikasi || 'Belum Ditentukan'}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Nilai SHST</label>
              <p className="text-gray-900 font-medium mt-1">
                Rp {asbData.shst ? Number(asbData.shst).toLocaleString('id-ID') : '0'} / m²
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm text-gray-600">Nominal BPS</label>
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                Rp {asbData.nominalBps ? Number(asbData.nominalBps).toLocaleString('id-ID') : '0'}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Nominal BPNS</label>
              <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg text-center font-semibold mt-1">
                Rp {asbData.nominalBpns ? Number(asbData.nominalBpns).toLocaleString('id-ID') : '0'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Components Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Daftar Komponen Standar</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Komponen</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Bobot (%)</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Rincian Harga</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {components.length > 0 ? (
                components.map((comp, index) => {
                  const state = formState[`row_${comp.id}`] || { percentage: 0, checked: false };
                  return (
                    <tr key={comp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{comp.komponenBangunan?.komponen || '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium">
                          {state.percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">
                        Rp {comp.rincianHarga ? Number(comp.rincianHarga).toLocaleString('id-ID') : '0'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {state.percentage > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Terisi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            Kosong
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>Tidak ada data komponen standar</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Notes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Catatan Verifikasi (Opsional)</h3>
        <textarea
          value={verificationNotes}
          onChange={(e) => setVerificationNotes(e.target.value)}
          placeholder="Tambahkan catatan verifikasi jika diperlukan..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/usulan/bangunan-gedung/verify/${params.id}`)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            <X className="w-5 h-5" />
            Kembali
          </button>
          {idAsbStatus !== null && idAsbStatus !== 9 && (
            <span className="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
              Verifikasi BPS hanya aktif saat status ID = 9
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Verifikasi BPS Button - only enabled when idAsbStatus is 9 */}
          <button
            onClick={handleVerifikasiBPS}
            disabled={idAsbStatus !== 9 || isVerifyingBPS}
            className="inline-flex items-center gap-2 px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title={idAsbStatus !== 9 ? 'Hanya dapat diakses saat status adalah Verifikasi LTB/KLB/KFB (9)' : ''}
          >
            {isVerifyingBPS ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
            Verifikasi BPS
          </button>
        </div>
      </div>
    </div>
  );
}
