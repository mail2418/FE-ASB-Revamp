'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Route, Search, Plus, Eye, Edit2, Download, ChevronDown, ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle } from 'lucide-react';

// Verification status types
type VerificationStatus = 'Belum' | 'Disetujui' | 'Ditolak' | 'Menunggu';

interface VerificationStages {
  adpem: VerificationStatus;
  bappeda: VerificationStatus;
  bpkad: VerificationStatus;
}

// Interface for Jalan form data
interface UsulanJalan {
  id: string;
  jenisUsulan: 'Perawatan' | 'Pembuatan';
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

// Verification badge component
const VerificationBadge = ({ status }: { status: VerificationStatus }) => {
  const config = {
    Belum: { bg: 'bg-gray-100', text: 'text-gray-600', icon: <Clock className="w-3 h-3" /> },
    Menunggu: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-3 h-3" /> },
    Disetujui: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
    Ditolak: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-3 h-3" /> },
  };
  const c = config[status] || config.Menunggu;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.icon}
      {status}
    </span>
  );
};

// Jenis badge component
const JenisBadge = ({ jenis }: { jenis: string }) => {
  const isPembuatan = jenis === 'Pembuatan';
  return (
    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
      isPembuatan ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
    }`}>
      {jenis}
    </span>
  );
};

// Mock data with 3-stage verification - fallback when localStorage is empty
const mockData: UsulanJalan[] = [
  {
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
      adpem: 'Disetujui',
      bappeda: 'Disetujui',
      bpkad: 'Disetujui',
    },
    createdAt: '2024-11-15',
    createdBy: 'Anggito Anju',
  },
  {
    id: 'mock-2',
    jenisUsulan: 'Perawatan',
    lebarJalan: '7',
    strukturPerkerasan: 'kaku',
    repetisiBeban: '15',
    nilaiCBR: '8',
    spesifikasiDesain: 'bagan_4',
    mutuBeton: "fc_25",
    ruangLingkup: ['Perkerasan Beton', 'Lapis Pondasi', 'Pemadatan Tanah', 'Marka dan Rambu Jalan'],
    keteranganTambahan: 'Tebal timbunan 50 cm',
    verificationStatus: {
      adpem: 'Disetujui',
      bappeda: 'Menunggu',
      bpkad: 'Belum',
    },
    createdAt: '2024-11-20',
    createdBy: 'Muhammad Ismail',
  },
  {
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
      adpem: 'Disetujui',
      bappeda: 'Ditolak',
      bpkad: 'Belum',
    },
    createdAt: '2024-11-10',
    createdBy: 'Samarta Admin',
  },
];

// Helper to get overall status
const getOverallStatus = (v: VerificationStages): string => {
  if (v.adpem === 'Disetujui' && v.bappeda === 'Disetujui' && v.bpkad === 'Disetujui') {
    return 'Sukses';
  }
  if (v.adpem === 'Ditolak' || v.bappeda === 'Ditolak' || v.bpkad === 'Ditolak') {
    return 'Ditolak';
  }
  return 'Sedang Diproses';
};

export default function UsulanJalanPage() {
  const router = useRouter();
  const [data, setData] = useState<UsulanJalan[]>([]);
  const [filteredData, setFilteredData] = useState<UsulanJalan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState<string>('');
  const itemsPerPage = 10;

  // Load data from localStorage on mount
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

    // Load localStorage data
    const storedData = localStorage.getItem('usulan_jalan_submissions');
    let localData: UsulanJalan[] = [];
    
    if (storedData) {
      try {
        localData = JSON.parse(storedData);
      } catch (e) {
        console.error('Error parsing stored data:', e);
      }
    }
    
    // Combine localStorage data with mock data
    const combinedData = [...localData, ...mockData];
    setData(combinedData);
    setFilteredData(combinedData);
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Handle search and filters
  useEffect(() => {
    let filtered = [...data];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.jenisUsulan.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.strukturPerkerasan.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.lebarJalan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) => getOverallStatus(item.verificationStatus) === statusFilter);
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchTerm, statusFilter, data]);

  // Calculate statistics
  const stats = {
    total: data.length,
    sukses: data.filter((d) => getOverallStatus(d.verificationStatus) === 'Sukses').length,
    proses: data.filter((d) => getOverallStatus(d.verificationStatus) === 'Sedang Diproses').length,
    ditolak: data.filter((d) => getOverallStatus(d.verificationStatus) === 'Ditolak').length,
  };

  // Format struktur perkerasan for display
  const formatStruktur = (s: string): string => {
    if (s === 'lentur') return 'Perkerasan Lentur';
    if (s === 'kaku') return 'Perkerasan Kaku';
    return s;
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Usulan</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-lg">
              <Route className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Sukses</p>
              <p className="text-2xl font-bold text-green-600">{stats.sukses}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Sedang Diproses</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.proses}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ditolak</p>
              <p className="text-2xl font-bold text-red-600">{stats.ditolak}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header with Filters */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Daftar Usulan Jalan</h2>
            <div className="flex flex-wrap gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent w-48"
                />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {userRole === 'opd' && (
                  <button
                    onClick={() => router.push('/usulan/jalan/tambah')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    Tambah Usulan
                  </button>
                )}
              </div>  
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jenis</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lebar</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Struktur</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ESA5</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">CBR</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Info Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{startIndex + index + 1}</td>
                    <td className="px-4 py-3">
                      <JenisBadge jenis={item.jenisUsulan} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.lebarJalan} m</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        item.strukturPerkerasan === 'lentur' || item.strukturPerkerasan === 'Perkerasan Lentur'
                          ? 'bg-indigo-100 text-indigo-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {formatStruktur(item.strukturPerkerasan)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.repetisiBeban} juta</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.nilaiCBR}%</td>
                    <td className="px-4 py-3">
                      {/* Verification Sequence - similar to Usulan Bangunan */}
                      <div className="flex items-center justify-center gap-1">
                        {[
                          { key: 'adpem', label: 'Adpem' },
                          { key: 'bappeda', label: 'BAPPEDA' },
                          { key: 'bpkad', label: 'BPKAD' },
                        ].map((stage, idx) => {
                          const status = item.verificationStatus[stage.key as keyof VerificationStages];
                          const statusColors = {
                            Disetujui: 'bg-green-100 text-green-700 border-green-300',
                            Ditolak: 'bg-red-100 text-red-700 border-red-300',
                            Menunggu: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                            Belum: 'bg-gray-100 text-gray-500 border-gray-300',
                          };
                          const color = statusColors[status] || statusColors.Belum;
                          
                          return (
                            <React.Fragment key={stage.key}>
                              <div
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border min-w-[70px] justify-center ${color}`}
                                title={`${stage.label} - ${status}`}
                              >
                                {status === 'Disetujui' && <CheckCircle className="w-3 h-3" />}
                                {status === 'Ditolak' && <XCircle className="w-3 h-3" />}
                                {status === 'Menunggu' && <Clock className="w-3 h-3" />}
                                {status === 'Belum' && <Clock className="w-3 h-3" />}
                                <span className="text-[10px] font-semibold">{stage.label}</span>
                              </div>
                              {idx < 2 && (
                                <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => router.push(`/usulan/jalan/detail/${item.id}`)}
                          className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition-colors cursor-pointer"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {userRole === 'opd' && (
                          <button
                            onClick={() => router.push(`/usulan/jalan/edit/${item.id}`)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors cursor-pointer"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Route className="w-12 h-12 text-gray-300" />
                      <p className="text-lg font-medium">Tidak ada data</p>
                      <p className="text-sm">Belum ada usulan jalan yang sesuai dengan filter</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Menampilkan <span className="font-medium">{filteredData.length > 0 ? startIndex + 1 : 0}</span> - <span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> dari <span className="font-medium">{filteredData.length}</span> data
            </p>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-teal-500 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}