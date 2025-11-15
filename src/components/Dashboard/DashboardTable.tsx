

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
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [selectedFilter, setSelectedFilter] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onFilterChange) {
      onFilterChange({ search: value, status: selectedFilter });
    }
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    if (onFilterChange) {
      onFilterChange({ search: searchTerm, status: filter });
    }
    setFilterOpen(false);
  };

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-linear-to-r from-teal-500 to-teal-600 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-white font-semibold text-lg">Filter usulan by</h3>
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {selectedFilter === 'all' ? 'Semua Status' : selectedFilter}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {filterOpen && (
                <div className="absolute top-full mt-2 left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  {['all', 'Sukses', 'Sedang Diproses', 'Ditolak', 'Menunggu'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => handleFilterSelect(filter)}
                      className={cn(
                        'w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors text-black',
                        selectedFilter === filter && 'bg-gray-50 font-medium'
                      )}
                    >
                      {filter === 'all' ? 'Semua Status' : filter}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button className="bg-white text-teal-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Project: New car
            </button>
            <button className="bg-white text-teal-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Project: New campaign
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Cari usulan..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jenis
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
                Satuan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
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
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-800">
                    {item.satuan2}
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