

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronLeft, ChevronRight, Search, Filter, Download } from 'lucide-react';
import type { UsulanData } from '@/types';

interface DashboardTableProps {
  data: UsulanData[];
  onFilterChange?: (filters: any) => void;
  className?: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles = {
    'Sukses': 'bg-green-100 text-green-800 border-green-200',
    'Sedang Diproses': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Ditolak': 'bg-red-100 text-red-800 border-red-200',
    'Menunggu': 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const statusIcons = {
    'Sukses': '✓',
    'Sedang Diproses': '⏳',
    'Ditolak': '✗',
    'Menunggu': '⏸',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border',
        statusStyles[status as keyof typeof statusStyles] || statusStyles['Menunggu']
      )}
    >
      <span className="text-base">{statusIcons[status as keyof typeof statusIcons]}</span>
      <span>{status}</span>
    </div>
  );
};

const JenisBadge = ({ jenis }: { jenis: string }) => {
  const jenisStyles = {
    'Umum': 'bg-blue-100 text-blue-800 border-blue-200',
    'Bangunan': 'bg-orange-100 text-orange-800 border-orange-200',
    'Jalan': 'bg-purple-100 text-purple-800 border-purple-200',
  };

  const jenisIcons = {
    'Umum': '📋',
    'Bangunan': '🏢',
    'Jalan': '🛣️',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border',
        jenisStyles[jenis as keyof typeof jenisStyles] || jenisStyles['Umum']
      )}
    >
      <span>{jenisIcons[jenis as keyof typeof jenisIcons]}</span>
      <span>{jenis}</span>
    </div>
  );
};

export default function DashboardTable({
  data,
  onFilterChange,
  className,
}: DashboardTableProps) {
  const [jenisFilterOpen, setJenisFilterOpen] = React.useState(false);
  const [statusFilterOpen, setStatusFilterOpen] = React.useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = React.useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = React.useState(false);
  const [selectedJenisFilter, setSelectedJenisFilter] = React.useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = React.useState('all');
  const [selectedYear, setSelectedYear] = React.useState('2025');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  // Reset page when data changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const years = ['2025', '2024', '2023', '2022', '2021'];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onFilterChange) {
      onFilterChange({ 
        search: value, 
        jenis: selectedJenisFilter,
        status: selectedStatusFilter 
      });
    }
  };

  const handleJenisFilterSelect = (filter: string) => {
    setSelectedJenisFilter(filter);
    if (onFilterChange) {
      onFilterChange({ 
        search: searchTerm, 
        jenis: filter,
        status: selectedStatusFilter 
      });
    }
    setJenisFilterOpen(false);
  };

  const handleStatusFilterSelect = (filter: string) => {
    setSelectedStatusFilter(filter);
    if (onFilterChange) {
      onFilterChange({ 
        search: searchTerm, 
        jenis: selectedJenisFilter,
        status: filter 
      });
    }
    setStatusFilterOpen(false);
  };

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden', className)}>
      {/* Header with Project Info and Search */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {/* Year Dropdown */}
            <div className="relative">
              <button
                onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                className="bg-white/90 text-teal-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors flex items-center gap-2"
              >
                Tahun: {selectedYear}
                <ChevronDown className="w-4 h-4" />
              </button>
              {yearDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {years.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setYearDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors',
                        selectedYear === year && 'bg-teal-50 text-teal-700 font-medium'
                      )}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Cari usulan..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>Jenis</span>
                  <div className="relative">
                    <button
                      onClick={() => setJenisFilterOpen(!jenisFilterOpen)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors normal-case font-normal text-gray-700"
                    >
                      <Filter className="h-3 w-3" />
                      {selectedJenisFilter === 'all' ? 'Semua' : selectedJenisFilter}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    
                    {jenisFilterOpen && (
                      <div className="absolute top-full mt-1 left-0 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        {['all', 'Umum', 'Bangunan', 'Jalan'].map((filter) => (
                          <button
                            key={filter}
                            onClick={() => handleJenisFilterSelect(filter)}
                            className={cn(
                              'w-full text-left px-3 py-2 text-xs hover:bg-gray-100 transition-colors text-gray-700',
                              selectedJenisFilter === filter && 'bg-gray-50 font-medium'
                            )}
                          >
                            {filter === 'all' ? 'Semua' : filter}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uraian
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Surat Permohonan
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Surat Rekomendasi
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>Status</span>
                  <div className="relative">
                    <button
                      onClick={() => setStatusFilterOpen(!statusFilterOpen)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors normal-case font-normal text-gray-700"
                    >
                      <Filter className="h-3 w-3" />
                      {selectedStatusFilter === 'all' ? 'Semua' : selectedStatusFilter}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    
                    {statusFilterOpen && (
                      <div className="absolute top-full mt-1 left-0 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        {['all', 'Sukses', 'Sedang Diproses', 'Ditolak', 'Menunggu'].map((filter) => (
                          <button
                            key={filter}
                            onClick={() => handleStatusFilterSelect(filter)}
                            className={cn(
                              'w-full text-left px-3 py-2 text-xs hover:bg-gray-100 transition-colors text-gray-700',
                              selectedStatusFilter === filter && 'bg-gray-50 font-medium'
                            )}
                          >
                            {filter === 'all' ? 'Semua' : filter}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item, index) => (
              <tr
                key={item.id || index}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <JenisBadge jenis={item.jenis} />
                </td>
                <td className="px-4 py-3 text-base text-gray-900">
                  {item.uraian || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {item.suratPermohonan ? (
                    <a
                      href={item.suratPermohonan}
                      className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 text-base font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </a>
                  ) : (
                    <span className="text-base text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {item.suratRekomendasi ? (
                    <a
                      href={item.suratRekomendasi}
                      className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 text-base font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </a>
                  ) : (
                    <span className="text-base text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Menampilkan <span className="font-medium">{data.length > 0 ? startIndex + 1 : 0}</span> - <span className="font-medium">{Math.min(endIndex, data.length)}</span> dari{' '}
            <span className="font-medium">{data.length}</span> hasil
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
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-teal-500 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
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
  );
}