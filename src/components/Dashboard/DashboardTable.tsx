

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Search, Filter } from 'lucide-react';
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
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border',
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
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border',
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
  const [selectedJenisFilter, setSelectedJenisFilter] = React.useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          <div className="flex gap-2">
            <button className="bg-white text-teal-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Proyek: Pengadaan Bangunan Gedung ABCDE di Jl. ABCDE
            </button>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      <div className="absolute top-full mt-1 left-0 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uraian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Spek
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Satuan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
            {data.map((item, index) => (
              <tr
                key={item.id || index}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <JenisBadge jenis={item.jenis} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {item.uraian}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {item.spek}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-800">
                    {item.satuan}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
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
            Menampilkan <span className="font-medium">{data.length}</span> dari{' '}
            <span className="font-medium">{data.length}</span> hasil
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 text-sm bg-teal-500 text-white rounded hover:bg-teal-600">
              1
            </button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}