'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  ChevronDown,
  Save,
  X
} from 'lucide-react';

// Floor type definition
interface Floor {
  id: string;
  jenisLantai: string;
  fungsiLantai: string;
  luas: string;
  notes: string;
}

export default function TambahUsulanBangunanGedung() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API Data States
  const [jenisLantaiOptions, setJenisLantaiOptions] = useState<Array<{ id: number; lantai: string; type: string; koef: string; idSatuan: number }>>([]);
  const [fungsiLantaiOptions, setFungsiLantaiOptions] = useState<Array<{ id: number; nama_fungsi_ruang: string; koef: string; isActive: boolean }>>([]);
  const [rekeningOptions, setRekeningOptions] = useState<Array<{ id: number; rekening_kode: string; rekening_uraian: string }>>([]);
  const [jenisOptions, setJenisOptions] = useState<Array<{ id: number; jenis: string }>>([]);
  const [tipeBangunanApiOptions, setTipeBangunanApiOptions] = useState<Array<{ id: number; tipe_bangunan: string }>>([]);
  const [kabKotaOptions, setKabKotaOptions] = useState<Array<{ id: number; nama: string }>>([]);
  const [kecamatanOptions, setKecamatanOptions] = useState<Array<{ id: number; namaKecamatan: string; idKabkota: number, kodeKecamatan: string }>>([]);
  const [kelurahanOptions, setKelurahanOptions] = useState<Array<{ id: number; namaKelurahan: string; idKecamatan: number }>>([]);
  const [filteredKelurahanOptions, setFilteredKelurahanOptions] = useState<Array<{ id: number; namaKelurahan: string; kecamatanId?: number }>>([]);
  const [loadingLantai, setLoadingLantai] = useState(false);
  const [loadingFungsi, setLoadingFungsi] = useState(false);
  const [loadingJenis, setLoadingJenis] = useState(false);
  const [loadingTipeBangunan, setLoadingTipeBangunan] = useState(false);
  const [loadingKabKota, setLoadingKabKota] = useState(false);
  const [loadingKecamatan, setLoadingKecamatan] = useState(false);
  const [loadingKelurahan, setLoadingKelurahan] = useState(false);

  // Search states for dropdowns
  const [searchRekening, setSearchRekening] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    jenis: 'Pembangunan',
    tipeBangunan: '',
    deskripsiBangunan: '',
    lokasi: '',
    kabKota: '',
    kecamatan: '',
    kelurahan: '',
    jumlahLantai: '1',
    luasTanah: '',
    kodeRekeningBelanja1: 0,
    klasifikasi: '',
    nilaiASB: '',
    jumlahKontraktor: '',
    suratPermohonan: null as File | null,
  });

  // Floors state - start with 1 empty floor
  const [floors, setFloors] = useState<Floor[]>([
    {
    id: '1',
    jenisLantai: '',
    fungsiLantai: '',
    luas: '',
    notes: '',
  }]);
  // Fetch Jenis Lantai data
  React.useEffect(() => {
    const fetchJenisLantai = async () => {
      setLoadingLantai(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch('/api/usulan/bangunan-gedung/lantai', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Jenis Lantai data:', data);
          setJenisLantaiOptions(data.data?.data || data.data || []);
        }
      } catch (error) {
        console.error('Error fetching Jenis Lantai:', error);
      } finally {
        setLoadingLantai(false);
      }
    };

    fetchJenisLantai();
  }, []);
  // Fetch Fungsi Lantai data
  React.useEffect(() => {
    const fetchFungsiLantai = async () => {
      setLoadingFungsi(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch('/api/usulan/bangunan-gedung/fungsi-ruang', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fungsi Ruang data:', data);
          setFungsiLantaiOptions(data.data?.data || []);
        }
        console.log(fungsiLantaiOptions)
      } catch (error) {
        console.error('Error fetching Fungsi Ruang:', error);
      } finally {
        setLoadingFungsi(false);
      }
    };

    fetchFungsiLantai();
  }, []);
  // Fetch Rekening data
  React.useEffect(() => {
    const fetchRekening = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch('/api/superadmin/rekening', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        console.log(response)
        if (response.ok) {
          const data = await response.json();
          console.log('Rekening data:', data);
          setRekeningOptions(data.data?.data || data.data || data || []);
        }
      } catch (error) {
        console.error('Error fetching Rekening:', error);
      }
    };

    fetchRekening();
  }, []);
  // Fetch Jenis data (Pembangunan, Rehabilitasi, etc.)
  React.useEffect(() => {
    const fetchJenis = async () => {
      setLoadingJenis(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch('/api/usulan/bangunan-gedung/jenis', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Jenis data:', data);
          setJenisOptions(data.data?.data || data.data || []);
        }
      } catch (error) {
        console.error('Error fetching Jenis:', error);
      } finally {
        setLoadingJenis(false);
      }
    };

    fetchJenis();
  }, []);
  // Fetch Tipe Bangunan data
  React.useEffect(() => {
    const fetchTipeBangunan = async () => {
      setLoadingTipeBangunan(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch('/api/usulan/bangunan-gedung/tipe-bangunan', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const tipeBangunan = data.data?.data || data.data || [];
          const tipeBangunanFilter = tipeBangunan.filter((item: any) => item.tipe_bangunan == "Rumah Negara" || item.tipe_bangunan == "Gedung Negara");
          console.log('Tipe Bangunan data:', data);
          setTipeBangunanApiOptions(tipeBangunanFilter);
        }
      } catch (error) {
        console.error('Error fetching Tipe Bangunan:', error);
      } finally {
        setLoadingTipeBangunan(false);
      }
    };

    fetchTipeBangunan();
  }, []);
  // Fetch Kab/Kota data - only pick "Kota TulungAgung"
  React.useEffect(() => {
    const fetchKabKota = async () => {
      setLoadingKabKota(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch('/api/usulan/bangunan-gedung/kab-kota', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Kab/Kota data:', data);
          const allKabKota = data.data?.kabkotas || data.data || [];
          // Filter to only pick "Kota TulungAgung"
          const tulungAgung = allKabKota.find((item: any) => 
            item.nama?.toLowerCase().includes('tulungagung') || 
            item.nama?.toLowerCase().includes('tulung agung')
          );
          if (tulungAgung) {
            setKabKotaOptions([tulungAgung]);
            // Auto-set kabKota if found
            setFormData(prev => ({ ...prev, kabKota: tulungAgung.id.toString() }));
          }
        }
      } catch (error) {
        console.error('Error fetching Kab/Kota:', error);
      } finally {
        setLoadingKabKota(false);
      }
    };

    fetchKabKota();
  }, []);
  // Fetch Kecamatan data
  React.useEffect(() => {
    const fetchKecamatan = async () => {
      setLoadingKecamatan(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch('/api/usulan/bangunan-gedung/kecamatan', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Kecamatan data:', data);
          const kecamatans = data.data?.data || data.data?.kecamatans || data.data || [];
          setKecamatanOptions(kecamatans);
        }
      } catch (error) {
        console.error('Error fetching Kecamatan:', error);
      } finally {
        setLoadingKecamatan(false);
      }
    };

    fetchKecamatan();
  }, []);
  // Fetch Kelurahan data
  React.useEffect(() => {
    const fetchKelurahan = async () => {
      setLoadingKelurahan(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch('/api/usulan/bangunan-gedung/kelurahan', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Kelurahan data:', data);
          const kelurahans = data.data?.data || data.data?.kelurahans || data.data || [];
          setKelurahanOptions(kelurahans);
        }
      } catch (error) {
        console.error('Error fetching Kelurahan:', error);
      } finally {
        setLoadingKelurahan(false);
      }
    };

    fetchKelurahan();
  }, []);
  // Filter kelurahan based on selected kecamatan
  React.useEffect(() => {
    if (formData.kecamatan) {
      const kecamatanId = parseInt(formData.kecamatan);
      const filtered = kelurahanOptions.filter(
        (kel) => kel.idKecamatan === kecamatanId
      );
      setFilteredKelurahanOptions(filtered);
      
      // Reset kelurahan if not in filtered list
      if (formData.kelurahan) {
        const kelurahanExists = filtered.some(
          (kel) => kel.id.toString() === formData.kelurahan
        );
        if (!kelurahanExists) {
          setFormData(prev => ({ ...prev, kelurahan: '' }));
        }
      }
    } else {
      setFilteredKelurahanOptions([]);
      setFormData(prev => ({ ...prev, kelurahan: '' }));
    }
  }, [formData.kecamatan, kelurahanOptions]);
  // Load saved state on mount
  React.useEffect(() => {
    const savedData = localStorage.getItem('usulan_bangunan_new_entry');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.formData) {
          // Note: File objects cannot be stored in localStorage, so suratPermohonan will be null
          setFormData(prev => ({ ...prev, ...parsed.formData, suratPermohonan: null }));
        }
        if (parsed.floors) {
          setFloors(parsed.floors);
        }
      } catch (e) {
        console.error('Failed to parse saved form data', e);
      }
    }
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Reset klasifikasi when tipeBangunan (building type) changes
      if (name === 'tipeBangunan') {
        updated.klasifikasi = '';
      }
      
      return updated;
    });
  };

  // Update floor
  const handleFloorChange = (id: string, field: keyof Floor, value: string) => {
    setFloors(floors.map(floor => 
      floor.id === id ? { ...floor, [field]: value } : floor
    ));
  };

  // Handle jumlahLantai change - regenerate floors array
  const handleJumlahLantaiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setFormData(prev => ({ ...prev, jumlahLantai: newValue }));
    
    const numFloors = parseInt(newValue);
    const newFloors: Floor[] = Array.from({ length: numFloors }, (_, i) => ({
      id: `${i + 1}`,
      jenisLantai: `lantai-${i + 1}`,
      fungsiLantai: '',
      luas: '',
      notes: '',
    }));
    
    setFloors(newFloors);
    // Reset calculated values when floors change
    setFormData(prev => ({ ...prev, klasifikasi: '', nilaiASB: '' }));
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('accessToken');

      if (!token) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        router.push('/login');
        return;
      }

      // Get current date in dd-mm-yyyy format
      const now = new Date();
      const year = now.getFullYear();

      // Prepare request body for backend API
      const requestBodyASB = {
        tahunAnggaran: year,
        namaAsb: formData.deskripsiBangunan,
        alamat: formData.lokasi,
        totalLantai: floors.length || parseInt(formData.jumlahLantai || '1'),
        idAsbTipeBangunan: parseInt(formData.tipeBangunan || '1'),
        idKabkota: parseInt(formData.kabKota || '1'),
        jumlahKontraktor: formData.jumlahKontraktor,
        idAsbJenis: parseInt(formData.jenis || '1'),
      };

      // CREATE STORE INDEX
      const responseASB = await fetch('/api/usulan/bangunan-gedung/asb/store-index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBodyASB),
      });

      if (!responseASB.ok) {
        const errorData = await responseASB.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal menyimpan data ke server');
      }

      const resultASB = await responseASB.json();
      console.log('Backend responseASB:', resultASB);
      const resultASBfiltered = resultASB.data?.data || resultASB.data || []
      console.log('Backend responseASB:', resultASBfiltered);
      
      // Prepare request body for backend API
      const requestBodyLantai = {
          id_asb: resultASBfiltered.id,
          id_asb_detail: [],
          luas_lantai: floors.map(floor => parseFloat(floor.luas)),
          id_asb_lantai: floors.map(floor => parseInt(floor.jenisLantai)),
          id_asb_fungsi_ruang: floors.map(floor => parseInt(floor.fungsiLantai))
      };

      // Send UPDATE Store Rekening

      // Prepare request body for backend API
      const requestBodyRekening = {
          id_asb: resultASBfiltered.id,
          id_rekening: formData.kodeRekeningBelanja1
      };
      const responseRekening = await fetch('/api/usulan/bangunan-gedung/asb/store-rekening', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBodyRekening),
      });

      if (!responseRekening.ok) {
        const errorData = await responseRekening.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal mengubah data ke server');
      }
      
      const resultRekening = await responseRekening.json();
      const resultRekeningfiltered = resultRekening.data?.data || resultRekening.data || []
      console.log('Backend responseRekening:', resultRekeningfiltered);

      // Send UPDATE Store Lantai
      const responseLantai = await fetch('/api/usulan/bangunan-gedung/asb/store-lantai', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBodyLantai),
      });

      if (!responseLantai.ok) {
        const errorData = await responseLantai.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal mengubah data ke server');
      }

      const resultLt = await responseLantai.json();
      const resultLantaifiltered = resultLt.data?.data || resultLt.data || []
      console.log('Backend responseLantai:', resultLantaifiltered);

      // Save to localStorage
      const dataToSave = {
        formData: { ...formData, suratPermohonan: null },
        floors,
        resultASBfiltered,
        resultLantaifiltered,
        resultRekeningfiltered
      };
      localStorage.setItem('usulan_bangunan_new_entry', JSON.stringify(dataToSave));

      // Redirect to next step
      router.push('/usulan/bangunan-gedung/tambah/input-komponen-standar-bangunan');

    } catch (error) {
      console.error('Error submitting data:', error);
      alert(`Gagal menyimpan data: ${error instanceof Error ? error.message : 'Terjadi kesalahan'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 cursor-pointer">
            Tambah Usulan Belanja Bangunan Gedung
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Isi formulir di bawah untuk menambahkan usulan bangunan gedung baru
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Jenis */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Jenis* :
                </label>
                <div className="relative">
                  <select
                    required
                    name="jenis"
                    value={formData.jenis}
                    onChange={handleInputChange}
                    disabled={loadingJenis}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="">{loadingJenis ? 'Memuat...' : 'Pilih Jenis'}</option>
                    {jenisOptions.map((jenis) => (
                      <option key={jenis.id} value={jenis.id}>
                        {jenis.jenis}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Nama Bangunan (Type) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Bangunan* :
                </label>
                <div className="relative">
                  <select
                    required
                    name="tipeBangunan"
                    value={formData.tipeBangunan}
                    onChange={handleInputChange}
                    disabled={loadingTipeBangunan}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="">{loadingTipeBangunan ? 'Memuat...' : 'Pilih tipe bangunan'}</option>
                    {tipeBangunanApiOptions.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.tipe_bangunan}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Deskripsi Bangunan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi Bangunan* : 
                </label>
                <textarea
                  required
                  name="deskripsiBangunan"
                  value={formData.deskripsiBangunan}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Masukkan deskripsi bangunan"
                />
              </div>

              {/* Lokasi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasi* :
                </label>
                <textarea
                  required
                  name="lokasi"
                  value={formData.lokasi}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Masukkan lokasi"
                />
              </div>

              {/* Luas Tanah */}
              {formData.tipeBangunan == "2" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Luas Tanah (m²)* :
                </label>
                <input
                  required
                  type="number"
                  name="luasTanah"
                  value={formData.luasTanah}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Masukkan luas tanah dalam m²"
                  min="0"
                  step="0.01"
                />
              </div>
              )}

              {/* Jumlah Lantai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Lantai* :
                </label>
                <div className="relative">
                  <select
                    required
                    name="jumlahLantai"
                    value={formData.jumlahLantai}
                    onChange={handleJumlahLantaiChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Pilih jumlah lantai</option>
                    {[...Array(20)].map((_, index) => (
                      <option key={index + 1} value={index + 1}>
                        Lantai {index + 1}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                <p className="text-xs text-gray-500 mt-1">*generating Jenis Table Lantai</p>
              </div>

              {/* Kode Rekening Belanja */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Kode Rekening Belanja* :
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ketik untuk mencari kode rekening..."
                    value={searchRekening}
                    onChange={(e) => setSearchRekening(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {searchRekening && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {rekeningOptions
                        .filter(rekening => 
                          rekening.rekening_kode.toLowerCase().includes(searchRekening.toLowerCase()) ||
                          rekening.rekening_uraian.toLowerCase().includes(searchRekening.toLowerCase())
                        )
                        .map((rekening) => (
                          <div
                            key={rekening.id}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, kodeRekeningBelanja1: rekening.id }));
                              setSearchRekening('');
                            }}
                            className="px-4 py-2 hover:bg-orange-50 cursor-pointer text-sm"
                          >
                            <div className="font-medium text-gray-900">{rekening.rekening_kode}</div>
                            <div className="text-gray-600 text-xs">{rekening.rekening_uraian}</div>
                          </div>
                        ))}
                      {rekeningOptions.filter(rekening => 
                        rekening.rekening_kode.toLowerCase().includes(searchRekening.toLowerCase()) ||
                        rekening.rekening_uraian.toLowerCase().includes(searchRekening.toLowerCase())
                      ).length === 0 && (
                        <div className="px-4 py-2 text-sm text-gray-500">Tidak ada hasil</div>
                      )}
                    </div>
                  )}
                  {formData.kodeRekeningBelanja1 && !searchRekening && (
                    <div className="mt-2 p-2 bg-orange-50 rounded border border-orange-200">
                      <div className="text-sm font-medium text-gray-900">{formData.kodeRekeningBelanja1}</div>
                      <div className="text-xs text-gray-600">
                        {rekeningOptions.find(r => r.rekening_kode === formData.kodeRekeningBelanja1.toString())?.rekening_uraian}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">

              {/* Kab / Kota */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kab / Kota :
                </label>
                <div className="relative">
                  <select
                    name="kabKota"
                    value={formData.kabKota}
                    onChange={handleInputChange}
                    disabled={loadingKabKota || kabKotaOptions.length <= 1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="">{loadingKabKota ? 'Memuat...' : 'Tulung Agung'}</option>
                    {kabKotaOptions.map((kab) => (
                      <option key={kab.id} value={kab.id}>
                        {kab.nama}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Kecamatan & Kelurahan in a grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kecamatan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kecamatan* :
                  </label>
                  <div className="relative">
                    <select
                      required
                      name="kecamatan"
                      value={formData.kecamatan}
                      onChange={handleInputChange}
                      disabled={loadingKecamatan}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">
                        {loadingKecamatan ? 'Memuat...' : 'Pilih Kecamatan'}
                      </option>
                      {kecamatanOptions.map((kec) => (
                        <option key={kec.id} value={kec.id}>
                          {kec.namaKecamatan}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Kelurahan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kelurahan* :
                  </label>
                  <div className="relative">
                    <select
                      required
                      name="kelurahan"
                      value={formData.kelurahan}
                      onChange={handleInputChange}
                      disabled={loadingKelurahan || !formData.kecamatan}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">
                        {loadingKelurahan 
                          ? 'Memuat...' 
                          : !formData.kecamatan 
                            ? 'Pilih Kecamatan dahulu' 
                            : filteredKelurahanOptions.length === 0 
                              ? 'Tidak ada kelurahan' 
                              : 'Pilih Kelurahan'}
                      </option>
                      {filteredKelurahanOptions.map((kel) => (
                        <option key={kel.id} value={kel.id}>
                          {kel.namaKelurahan}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              {/*Number of Approximate Contractors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Perkiraan Kontraktor* :
                </label>
                <input
                  required
                  type="number"
                  name="jumlahKontraktor"
                  value={formData.jumlahKontraktor}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Masukkan jumlah kontraktor"
                  min="0"
                  step="1"
                />
              </div>
              {/* Floors Table */}
              <div className="bg-linear-to-r from-lime-500 to-lime-600 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">
                  Luas dan Fungsi Tiap Lantai Bangunan Gedung
                </h3>
                
                <div className="bg-white rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-lime-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                            Jenis Lantai
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                            Fungsi Lantai
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                            Luas (m²)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {floors.map((floor) => {
                          return (
                            <tr key={floor.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2">
                                <div className="relative">
                                  <select
                                    required
                                    value={floor.jenisLantai}
                                    onChange={(e) => handleFloorChange(floor.id, 'jenisLantai', e.target.value)}
                                    disabled={loadingLantai}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
                                  >
                                    <option value="">{loadingLantai ? 'Memuat...' : 'Pilih'}</option>
                                    {jenisLantaiOptions.map(opt => (
                                      <option key={opt.id} value={opt.id}>
                                        {opt.lantai}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="relative">
                                  <select
                                    required
                                    value={floor.fungsiLantai}
                                    onChange={(e) => handleFloorChange(floor.id, 'fungsiLantai', e.target.value)}
                                    disabled={loadingFungsi}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
                                  >
                                    <option value="">{loadingFungsi ? 'Memuat...' : 'Pilih'}</option>
                                    {fungsiLantaiOptions.map(opt => (
                                      <option key={opt.id} value={opt.id}>
                                        {opt.nama_fungsi_ruang}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  required
                                  type="text"
                                  value={floor.luas}
                                  onChange={(e) => handleFloorChange(floor.id, 'luas', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                                  placeholder="m2"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 " />
                Simpan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
