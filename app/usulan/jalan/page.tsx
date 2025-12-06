'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Route, Search, Plus, Eye, Download, ChevronDown, ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle } from 'lucide-react';

// Interface for Jalan form data
interface UsulanJalan {
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
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    Pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-3 h-3" /> },
    Approved: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
    Rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-3 h-3" /> },
  };
  const c = config[status as keyof typeof config] || config.Pending;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
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

// Mock data - in production this would come from API
const mockData: UsulanJalan[] = [
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
];

export default function UsulanJalanPage() {
  const router = useRouter();
  const [data, setData] = useState<UsulanJalan[]>(mockData);
  const [filteredData, setFilteredData] = useState<UsulanJalan[]>(mockData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchTerm, statusFilter, data]);

  // Calculate statistics
  const stats = {
    total: data.length,
    approved: data.filter((d) => d.status === 'Approved').length,
    pending: data.filter((d) => d.status === 'Pending').length,
    rejected: data.filter((d) => d.status === 'Rejected').length,
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
              <p className="text-sm text-gray-500">Disetujui</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Menunggu</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
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
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
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
                <button
                  onClick={() => router.push('/usulan/jalan/tambah')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  Tambah Usulan
                </button>
              </div>  
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jenis Usulan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lebar Jalan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Struktur Perkerasan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sumbu Kumulatif (ESA5)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nilai CBR Tanah</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{startIndex + index + 1}</td>
                    <td className="px-6 py-4">
                      <JenisBadge jenis={item.jenisUsulan} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.lebarJalan}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        item.strukturPerkerasan === 'Perkerasan Lentur' 
                          ? 'bg-indigo-100 text-indigo-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {item.strukturPerkerasan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.repetisiBeban} juta</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.nilaiCBR}%</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => router.push(`/usulan/jalan/detail/${item.id}`)}
                          className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition-colors cursor-pointer"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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
              Menampilkan <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> dari <span className="font-medium">{filteredData.length}</span> data
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