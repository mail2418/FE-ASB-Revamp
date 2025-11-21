'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Plus, 
  Trash2, 
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

// Floor options
const jenisLantaiOptions = [
  { value: 'lantai-1', label: 'Lantai 1', color: 'bg-green-500' },
  { value: 'lantai-2', label: 'Lantai 2', color: 'bg-yellow-500' },
  { value: 'lantai-3', label: 'Lantai 3', color: 'bg-red-500' },
  { value: 'lantai-4', label: 'Lantai 4', color: 'bg-gray-400' },
];

const fungsiLantaiOptions = [
  { value: 'kantor', label: 'Kantor', icon: '🏢' },
  { value: 'sekolah', label: 'Sekolah', icon: '📚' },
  { value: 'laboratorium', label: 'Laboratorium', icon: '🔬' },
  { value: 'igd-icu', label: 'IGD / ICU', icon: '🏥' },
];

const notesOptions = [
  { value: 'completed', label: 'Completed', icon: '✅' },
];

export default function TambahUsulanBangunanGedung() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    jenis: 'Pembangunan',
    namaBangunan: '',
    deskripsiAktivitas: '',
    lokasi: '',
    kelurahan: '',
    kecamatan: '',
    kabKota: '',
    jumlahLantai: '1',
    kodeRekeningBelanja1: '',
    kodeRekeningBelanja2: '',
    klasifikasi: 'Gedung Negara Tidak Sederhana',
    nilaiASB: '',
    suratPermohonan: null as File | null,
  });

  // Floors state
  const [floors, setFloors] = useState<Floor[]>([
    {
      id: '1',
      jenisLantai: 'lantai-1',
      fungsiLantai: 'kantor',
      luas: '250',
      notes: 'completed',
    },
    {
      id: '2',
      jenisLantai: 'lantai-2',
      fungsiLantai: 'sekolah',
      luas: '200',
      notes: 'completed',
    },
    {
      id: '3',
      jenisLantai: 'lantai-3',
      fungsiLantai: 'laboratorium',
      luas: '200',
      notes: 'completed',
    },
    {
      id: '4',
      jenisLantai: '',
      fungsiLantai: 'igd-icu',
      luas: '150',
      notes: 'completed',
    },
  ]);

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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, suratPermohonan: e.target.files![0] }));
    }
  };

  // Add new floor
  const handleAddFloor = () => {
    const newFloor: Floor = {
      id: `${floors.length + 1}`,
      jenisLantai: '',
      fungsiLantai: '',
      luas: '',
      notes: '',
    };
    setFloors([...floors, newFloor]);
  };

  // Remove floor
  const handleRemoveFloor = (id: string) => {
    setFloors(floors.filter(floor => floor.id !== id));
  };

  // Update floor
  const handleFloorChange = (id: string, field: keyof Floor, value: string) => {
    setFloors(floors.map(floor => 
      floor.id === id ? { ...floor, [field]: value } : floor
    ));
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save to localStorage
      // We exclude file object as it can't be serialized
      const dataToSave = {
        formData: { ...formData, suratPermohonan: null },
        floors
      };
      localStorage.setItem('usulan_bangunan_new_entry', JSON.stringify(dataToSave));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to next step
      router.push('/usulan/bangunan-gedung/tambah/input-komponen-standar-bangunan');
    } catch (error) {
      console.error('Error saving data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get floor option details
  const getJenisLantaiOption = (value: string) => 
    jenisLantaiOptions.find(opt => opt.value === value);
  
  const getFungsiLantaiOption = (value: string) => 
    fungsiLantaiOptions.find(opt => opt.value === value);

  const getNotesOption = (value: string) => 
    notesOptions.find(opt => opt.value === value);

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
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">(Nama Akun)</span>
          <span className="text-gray-400">/</span>
          <span className="font-medium">(Nama PD)</span>
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
                  Jenis :
                </label>
                <div className="relative">
                  <select
                    name="jenis"
                    value={formData.jenis}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="Pembangunan">Pembangunan</option>
                    <option value="Pemeliharaan">Pemeliharaan</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Nama Bangunan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Bangunan
                </label>
                <input
                  type="text"
                  name="namaBangunan"
                  value={formData.namaBangunan}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Masukkan nama bangunan"
                />
              </div>

              {/* Deskripsi Aktivitas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi Aktivitas
                </label>
                <textarea
                  name="deskripsiAktivitas"
                  value={formData.deskripsiAktivitas}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                />
              </div>

              {/* Lokasi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasi :
                </label>
                <textarea
                  name="lokasi"
                  value={formData.lokasi}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                />
              </div>

              {/* Jumlah Lantai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Lantai
                </label>
                <div className="relative">
                  <select
                    name="jumlahLantai"
                    value={formData.jumlahLantai}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>Lantai {num}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                <p className="text-xs text-gray-500 mt-1">*generating Jenis Table Lantai</p>
              </div>

              {/* Kode Rekening Belanja */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Kode Rekening Belanja
                </label>
                <div className="relative">
                  <select
                    name="kodeRekeningBelanja1"
                    value={formData.kodeRekeningBelanja1}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Pilih kode rekening</option>
                    <option value="5.2.02.01">5.2.02.01</option>
                    <option value="5.2.02.02">5.2.02.02</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    name="kodeRekeningBelanja2"
                    value={formData.kodeRekeningBelanja2}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Pilih kode rekening</option>
                    <option value="5.2.02.01">5.2.02.01</option>
                    <option value="5.2.02.02">5.2.02.02</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Kelurahan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kelurahan :
                </label>
                <div className="relative">
                  <select
                    name="kelurahan"
                    value={formData.kelurahan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Pilih kelurahan</option>
                    <option value="kelurahan-1">Kelurahan 1</option>
                    <option value="kelurahan-2">Kelurahan 2</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Kecamatan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kecamatan :
                </label>
                <div className="relative">
                  <select
                    name="kecamatan"
                    value={formData.kecamatan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Pilih kecamatan</option>
                    <option value="kecamatan-1">Kecamatan 1</option>
                    <option value="kecamatan-2">Kecamatan 2</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Pilih kab/kota</option>
                    <option value="kota-1">Kota 1</option>
                    <option value="kota-2">Kota 2</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
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
                            Luas
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {floors.map((floor) => {
                          const jenisOption = getJenisLantaiOption(floor.jenisLantai);
                          const fungsiOption = getFungsiLantaiOption(floor.fungsiLantai);
                          const notesOption = getNotesOption(floor.notes);

                          return (
                            <tr key={floor.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2">
                                <div className="relative">
                                  <select
                                    value={floor.jenisLantai}
                                    onChange={(e) => handleFloorChange(floor.id, 'jenisLantai', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                                  >
                                    <option value="">Pilih</option>
                                    {jenisLantaiOptions.map(opt => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                  {jenisOption && (
                                    <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${jenisOption.color}`} />
                                  )}
                                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="relative">
                                  <select
                                    value={floor.fungsiLantai}
                                    onChange={(e) => handleFloorChange(floor.id, 'fungsiLantai', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                                  >
                                    <option value="">Pilih</option>
                                    {fungsiLantaiOptions.map(opt => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.icon} {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={floor.luas}
                                  onChange={(e) => handleFloorChange(floor.id, 'luas', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                                  placeholder="m2"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <div className="relative">
                                  <select
                                    value={floor.notes}
                                    onChange={(e) => handleFloorChange(floor.id, 'notes', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                                  >
                                    <option value="">Pilih</option>
                                    {notesOptions.map(opt => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.icon} {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-red-400 italic px-3 py-2">
                    *Logical Klausul jgn lupa
                  </p>
                </div>
              </div>

              {/* Klasifikasi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Klasifikasi:
                </label>
                <div className="space-y-2">
                  <div className="bg-yellow-100 px-4 py-2 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Gedung Negara</span>
                  </div>
                  <div className="bg-yellow-100 px-4 py-2 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Tidak Sederhana</span>
                  </div>
                </div>
                <p className="text-xs text-red-400 italic mt-1">
                  *generating Klasifikasi & Nilai ASB
                </p>
              </div>

              {/* Nilai ASB */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nilai ASB :
                </label>
                <div className="bg-yellow-100 px-4 py-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Rp 5.600.000 / m2
                  </span>
                </div>
              </div>

              {/* Upload Surat Permohonan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Surat Permohonan
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={formData.suratPermohonan?.name || ''}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
                    placeholder="No file chosen"
                  />
                  <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                    <Upload className="h-5 w-5 text-gray-600" />
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                    />
                  </label>
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
