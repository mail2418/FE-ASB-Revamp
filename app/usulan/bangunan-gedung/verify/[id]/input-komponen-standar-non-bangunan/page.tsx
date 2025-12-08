'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, FileText, X, Building2 } from 'lucide-react';

// Interface for ASB BPNS component from API
interface AsbBipekNonStd {
  id: number;
  idAsb: number;
  idAsbKomponenBangunanNonStd: number;
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
  asbBipekNonStds: AsbBipekNonStd[];
}

interface RowState {
  percentage: number;
  checked?: boolean;
}

export default function VerifyKomponenNonStandarPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerifyingBPNS, setIsVerifyingBPNS] = useState(false);
  const [jenisVerifikator, setJenisVerifikator] = useState<string | null>(null);
  const [asbData, setAsbData] = useState<StoredAsbData | null>(null);
  const [components, setComponents] = useState<AsbBipekNonStd[]>([]);
  const [formState, setFormState] = useState<{ [key: string]: RowState }>({});
  const [verificationNotes, setVerificationNotes] = useState('');
  const [idAsbStatus, setIdAsbStatus] = useState<number | null>(null);

  // Handler for Verifikasi BPNS API call
  const handleVerifikasiBPNS = async () => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!id) return;
    setIsVerifyingBPNS(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        return;
      }

      const response = await fetch('/api/usulan/bangunan-gedung/asb/verif-bpns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id_asb: parseInt(id) }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal verifikasi BPNS');
      }

      alert('Verifikasi BPNS berhasil!');
      router.push(`/usulan/bangunan-gedung/verify/${id}`);
    } catch (error) {
      console.error('Error verifikasi BPNS:', error);
      alert(`Gagal verifikasi: ${error instanceof Error ? error.message : 'Terjadi kesalahan'}`);
    } finally {
      setIsVerifyingBPNS(false);
    }
  };

  // Check authorization - only ADPEM can access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const verifikatorInfo = localStorage.getItem('verifikatorInfo');
      if (verifikatorInfo) {
        setJenisVerifikator(verifikatorInfo);
        
        // Only ADPEM can access this page
        if (verifikatorInfo !== "ADPEM") {
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
          console.log('Loaded ASB data from localStorage (Non-Standard):', parsed);
          setAsbData(parsed);
          
          // Get idAsbStatus
          if (parsed.asbStatus?.id) {
            setIdAsbStatus(parsed.asbStatus.id);
          }
          
          // Set components from asbBipekNonStds
          if (parsed.asbBipekNonStds && parsed.asbBipekNonStds.length > 0) {
            setComponents(parsed.asbBipekNonStds);
            
            // Initialize form state with existing values
            const initialState: { [key: string]: RowState } = {};
            parsed.asbBipekNonStds.forEach((comp) => {
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

  // Handle verify button click
  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        return;
      }

      // Collect verified components
      const komponen_nonstd: number[] = [];
      const bobot_nonstd: number[] = [];

      Object.entries(formState).forEach(([key, state]) => {
        if (state.checked && state.percentage > 0) {
          const id = parseInt(key.replace('row_', ''));
          komponen_nonstd.push(id);
          bobot_nonstd.push(state.percentage);
        }
      });

      const requestBody = {
        id_asb: params.id,
        verif_komponen_nonstd: komponen_nonstd,
        verif_bobot_acuan_nonstd: bobot_nonstd,
      };

      console.log('Verifying non-standard components:', requestBody);

      // Call API to verify
      const response = await fetch('/api/usulan/bangunan-gedung/asb/verify-bpns', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        alert('Verifikasi komponen non-standar berhasil!');
        router.push(`/usulan/bangunan-gedung/verify/${params.id}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify');
      }
    } catch (error) {
      console.error('Error verifying:', error);
      alert('Terjadi kesalahan saat verifikasi. Silakan coba lagi.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (jenisVerifikator !== 'ADPEM') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-2 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Detail Usulan
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Verifikasi Komponen Non-Standar</h1>
        <p className="mt-1 text-sm text-gray-500">
          Verifikasi komponen non-standar bangunan (hanya lihat, tidak bisa edit)
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-indigo-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-indigo-800">Mode Verifikasi (ADPEM)</p>
            <p className="text-sm text-indigo-700 mt-1">
              Anda sedang dalam mode verifikasi. Data komponen ditampilkan untuk review. 
              Klik tombol "Verifikasi" di bawah untuk menyetujui data komponen non-standar.
            </p>
          </div>
        </div>
      </div>

      {/* Building Information Section */}
      {asbData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-6 h-6 text-indigo-600" />
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
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Daftar Komponen Non-Standar</h2>
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
                    <p>Tidak ada data komponen non-standar</p>
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
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
          {idAsbStatus !== null && idAsbStatus !== 10 && (
            <span className="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
              Verifikasi BPNS hanya aktif saat status ID = 10
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Verifikasi BPNS Button - only enabled when idAsbStatus is 10 */}
          <button
            onClick={handleVerifikasiBPNS}
            disabled={idAsbStatus !== 10 || isVerifyingBPNS}
            className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title={idAsbStatus !== 10 ? 'Hanya dapat diakses saat status adalah Verifikasi BPS (10)' : ''}
          >
            {isVerifyingBPNS ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
            Verifikasi BPNS
          </button>
        </div>
      </div>
    </div>
  );
}
